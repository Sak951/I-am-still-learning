# src/training/trainer.py
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from tqdm import tqdm
import os
from pathlib import Path
import time

class Trainer:
    def __init__(self, model, config, train_dataloader, val_dataloader=None, use_wandb=False):
        self.model = model
        self.config = config
        self.train_loader = train_dataloader
        self.val_loader = val_dataloader
        self.use_wandb = use_wandb
        
        # Optimizer
        self.optimizer = AdamW(
            model.parameters(),
            lr=config.learning_rate,
            betas=config.betas,
            weight_decay=config.weight_decay
        )
        
        # Learning rate scheduler
        self.scheduler = CosineAnnealingLR(
            self.optimizer, 
            T_max=config.epochs * len(train_dataloader)
        )
        
        # Mixed precision training - update to new API
        self.use_amp = torch.cuda.is_available()
        if self.use_amp:
            # Use new AMP API
            self.scaler = torch.amp.GradScaler('cuda')
        else:
            self.scaler = None
        
        # Create output directory
        self.output_dir = Path(config.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Tracking
        self.global_step = 0
        self.best_val_loss = float('inf')
        
        # Print device info
        print(f"Using device: {config.device}")
        if torch.cuda.is_available():
            print(f"GPU: {torch.cuda.get_device_name(0)}")
            print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    
    def train_epoch(self):
        self.model.train()
        total_loss = 0
        start_time = time.time()
        
        progress_bar = tqdm(self.train_loader, desc="Training")
        for batch_idx, (input_ids, labels) in enumerate(progress_bar):
            # Move data to device
            input_ids = input_ids.to(self.config.device)
            labels = labels.to(self.config.device)
            
            # Forward pass with mixed precision
            if self.use_amp:
                with torch.amp.autocast('cuda'):
                    _, loss = self.model(input_ids, labels)
                    loss = loss / self.config.gradient_accumulation_steps
                
                # Backward pass with gradient scaling
                self.scaler.scale(loss).backward()
            else:
                _, loss = self.model(input_ids, labels)
                loss = loss / self.config.gradient_accumulation_steps
                loss.backward()
            
            # Gradient accumulation
            if (batch_idx + 1) % self.config.gradient_accumulation_steps == 0:
                # Clip gradients
                if self.use_amp:
                    self.scaler.unscale_(self.optimizer)
                
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(), 
                    self.config.grad_clip
                )
                
                # Optimizer step
                if self.use_amp:
                    self.scaler.step(self.optimizer)
                    self.scaler.update()
                else:
                    self.optimizer.step()
                
                self.optimizer.zero_grad()
                
                # Update learning rate
                self.scheduler.step()
                
                # Logging
                self.global_step += 1
                current_loss = loss.item() * self.config.gradient_accumulation_steps
                
                if self.global_step % 100 == 0:
                    current_lr = self.optimizer.param_groups[0]['lr']
                    tqdm.write(f"Step {self.global_step}: loss={current_loss:.4f}, lr={current_lr:.2e}")
                    
                    # Log to wandb if enabled
                    if self.use_wandb:
                        import wandb
                        wandb.log({
                            'train_loss': current_loss,
                            'learning_rate': current_lr,
                            'step': self.global_step
                        })
            
            total_loss += loss.item()
            
            # Update progress bar
            progress_bar.set_postfix({
                'loss': loss.item() * self.config.gradient_accumulation_steps,
                'step': self.global_step
            })
        
        avg_loss = total_loss / len(self.train_loader)
        elapsed_time = time.time() - start_time
        print(f"Epoch completed in {elapsed_time:.2f}s, Average loss: {avg_loss:.4f}")
        
        # Log epoch metrics to wandb
        if self.use_wandb:
            import wandb
            wandb.log({'epoch_train_loss': avg_loss})
        
        return avg_loss
    
    def validate(self):
        self.model.eval()
        total_loss = 0
        
        with torch.no_grad():
            for input_ids, labels in tqdm(self.val_loader, desc="Validation"):
                input_ids = input_ids.to(self.config.device)
                labels = labels.to(self.config.device)
                
                if self.use_amp:
                    with torch.amp.autocast('cuda'):
                        _, loss = self.model(input_ids, labels)
                else:
                    _, loss = self.model(input_ids, labels)
                
                total_loss += loss.item()
        
        avg_loss = total_loss / len(self.val_loader)
        print(f"Validation loss: {avg_loss:.4f}")
        
        # Log validation loss to wandb
        if self.use_wandb:
            import wandb
            wandb.log({'val_loss': avg_loss, 'step': self.global_step})
        
        return avg_loss
    
    def train(self, epochs, start_epoch=0):
        for epoch in range(start_epoch, epochs):
            print(f"\nEpoch {epoch + 1}/{epochs}")
            train_loss = self.train_epoch()
            
            if self.val_loader:
                val_loss = self.validate()
                
                # Save best model
                if val_loss < self.best_val_loss:
                    self.best_val_loss = val_loss
                    self.save_checkpoint(epoch, is_best=True)
                    print(f"New best model saved! Validation loss: {val_loss:.4f}")
            else:
                # Save checkpoint periodically
                if (epoch + 1) % self.config.save_every == 0:
                    self.save_checkpoint(epoch)
            
            # Clear GPU cache if using CUDA
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
    def load_checkpoint(self, checkpoint_path):
        print(f"Loading training state from {checkpoint_path}...")
        checkpoint = torch.load(checkpoint_path, map_location=self.config.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        self.global_step = checkpoint.get('global_step', (checkpoint['epoch'] + 1) * len(self.train_loader))
        self.best_val_loss = checkpoint.get('best_val_loss', float('inf'))
        return checkpoint['epoch'] + 1
    
    def save_checkpoint(self, epoch, is_best=False):
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'scheduler_state_dict': self.scheduler.state_dict(),
            'config': self.config,
            'best_val_loss': self.best_val_loss
        }
        
        filename = self.output_dir / f'checkpoint_epoch_{epoch}.pt'
        torch.save(checkpoint, filename)
        
        if is_best:
            best_filename = self.output_dir / 'best_model.pt'
            torch.save(checkpoint, best_filename)
        
        print(f"Checkpoint saved to {filename}")
# scripts/finetune.py
import torch
import sys
sys.path.append('.')
from src.model.transformer import ToyLLM
from src.training.dataset import DataLoaderFromFile
from src.training.trainer import Trainer
from src.utils.tokenizer import SimpleTokenizer
import argparse

class FineTuner(Trainer):
    def __init__(self, model, config, train_dataloader, val_dataloader=None, freeze_layers=None):
        super().__init__(model, config, train_dataloader, val_dataloader)
        
        # Freeze layers if specified
        if freeze_layers:
            for name, param in model.named_parameters():
                if any(layer in name for layer in freeze_layers):
                    param.requires_grad = False
                    print(f"Freezing {name}")
        
        # Use lower learning rate for fine-tuning
        self.optimizer = torch.optim.AdamW(
            filter(lambda p: p.requires_grad, model.parameters()),
            lr=config.learning_rate * 0.1,
            betas=config.betas,
            weight_decay=config.weight_decay
        )

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to pretrained checkpoint")
    parser.add_argument("--data-file", type=str, required=True, help="Fine-tuning data")
    parser.add_argument("--val-file", type=str, help="Validation data")
    parser.add_argument("--freeze", nargs="+", help="Layers to freeze", default=[])
    args = parser.parse_args()
    
    # Load checkpoint
    checkpoint = torch.load(args.checkpoint, map_location='cpu')
    config = checkpoint['config']
    
    # Adjust config for fine-tuning
    config.epochs = 3  # Fewer epochs for fine-tuning
    config.learning_rate = config.learning_rate * 0.1
    
    # Load model
    model = ToyLLM(config)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(config.device)
    
    # Initialize tokenizer
    tokenizer = SimpleTokenizer(tokenizer_type="gpt2")
    
    # Create data loaders
    train_loader = DataLoaderFromFile(
        args.data_file,
        tokenizer,
        config.block_size,
        config.batch_size,
        shuffle=True
    ).create_dataloader()
    
    val_loader = None
    if args.val_file:
        val_loader = DataLoaderFromFile(
            args.val_file,
            tokenizer,
            config.block_size,
            config.batch_size,
            shuffle=False
        ).create_dataloader()
    
    # Fine-tune
    fine_tuner = FineTuner(
        model,
        config,
        train_loader,
        val_loader,
        freeze_layers=args.freeze
    )
    
    fine_tuner.train(config.epochs)

if __name__ == "__main__":
    main()
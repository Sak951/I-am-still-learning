# scripts/train.py
import torch
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.model.config import ModelConfig
from src.model.transformer import ToyLLM
from src.training.dataset import DataLoaderFromFile
from src.training.trainer import Trainer
from src.utils.tokenizer import SimpleTokenizer
import yaml
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, default="configs/base_config.yaml", 
                        help="Path to config file")
    parser.add_argument("--data-file", type=str, required=True, 
                        help="Path to training data")
    parser.add_argument("--val-file", type=str, 
                        help="Path to validation data")
    parser.add_argument("--wandb", action="store_true", 
                        help="Use wandb logging (requires wandb.init separately)")
    parser.add_argument("--wandb-project", type=str, default="toy-llm",
                        help="Wandb project name")
    parser.add_argument("--wandb-run", type=str, default=None,
                        help="Wandb run name")
    args = parser.parse_args()
    
    # Initialize wandb if requested
    if args.wandb:
        import wandb
        wandb.init(
            project=args.wandb_project,
            name=args.wandb_run or f"model_training_{time.strftime('%Y%m%d_%H%M%S')}",
            config=vars(args)
        )
        print("Wandb initialized!")
    
    # Clear GPU cache
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        print(f"GPU Memory before training: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
    
    # Check if data file exists
    if not os.path.exists(args.data_file):
        print(f"Error: Data file {args.data_file} does not exist!")
        print("Please fetch data first using: python scripts/fetch_data.py")
        sys.exit(1)
    
    # Load config
    with open(args.config, 'r') as f:
        config_dict = yaml.safe_load(f)
    
    config = ModelConfig(**config_dict)
    
    # Initialize tokenizer
    print("Loading tokenizer...")
    tokenizer = SimpleTokenizer(tokenizer_type="gpt2")
    config.vocab_size = tokenizer.vocab_size
    
    # Create data loaders
    print(f"Loading training data from {args.data_file}...")
    train_loader_obj = DataLoaderFromFile(
        args.data_file,
        tokenizer,
        config.block_size,
        config.batch_size,
        shuffle=True
    )
    train_loader = train_loader_obj.create_dataloader()
    
    if train_loader is None:
        print("Failed to create training data loader. Please check your data.")
        sys.exit(1)
    
    val_loader = None
    if args.val_file and os.path.exists(args.val_file):
        print(f"Loading validation data from {args.val_file}...")
        val_loader_obj = DataLoaderFromFile(
            args.val_file,
            tokenizer,
            config.block_size,
            config.batch_size,
            shuffle=False
        )
        val_loader = val_loader_obj.create_dataloader()
    
    # Initialize model
    print("Initializing model...")
    model = ToyLLM(config)
    model = model.to(config.device)
    print(f"Model has {model.get_num_params():,} parameters")
    
    # Initialize trainer
    trainer = Trainer(model, config, train_loader, val_loader, use_wandb=args.wandb)
    
    # Train
    print(f"Starting training for {config.epochs} epochs...")
    print(f"Total training steps: {len(train_loader) * config.epochs:,}")
    trainer.train(config.epochs)
    
    # Finish wandb
    if args.wandb:
        import wandb
        wandb.finish()

if __name__ == "__main__":
    import time
    main()
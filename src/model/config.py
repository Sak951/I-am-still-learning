# src/model/config.py
import torch
from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelConfig:
    # Model architecture
    vocab_size: int = 32000
    block_size: int = 512  # Context length
    n_embd: int = 768  # Embedding dimension
    n_head: int = 12  # Number of attention heads
    n_layer: int = 12  # Number of transformer blocks
    dropout: float = 0.1
    bias: bool = True  # Whether to use bias in linear layers
    
    # Training
    learning_rate: float = 3e-4
    weight_decay: float = 0.01
    betas: tuple = (0.9, 0.95)
    grad_clip: float = 1.0
    warmup_steps: int = 2000
    gradient_accumulation_steps: int = 1
    
    # System
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    dtype: str = "bfloat16" if torch.cuda.is_available() else "float32"
    
    # Data
    batch_size: int = 32
    epochs: int = 10
    save_every: int = 1
    eval_every: int = 500
    
    # Paths
    output_dir: str = "checkpoints"
    data_dir: str = "data/processed"
    
    def __post_init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
# src/training/dataset.py
import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
from pathlib import Path
import json
import sys

class TextDataset(Dataset):
    """Dataset for training language models"""
    def __init__(self, texts, tokenizer, block_size, max_samples=None):
        self.tokenizer = tokenizer
        self.block_size = block_size
        
        # Tokenize and encode all texts
        print("Tokenizing texts...")
        self.data = []
        
        for i, text in enumerate(texts):
            if max_samples and i >= max_samples:
                break
            try:
                tokens = tokenizer.encode(text)
                self.data.extend(tokens)
            except Exception as e:
                print(f"Error encoding text {i}: {e}")
                continue
            
            if i % 1000 == 0 and i > 0:
                print(f"Processed {i} texts, total tokens: {len(self.data):,}")
        
        # Convert to tensor
        if len(self.data) > 0:
            self.data = torch.tensor(self.data, dtype=torch.long)
        else:
            self.data = torch.tensor([], dtype=torch.long)
        print(f"Total tokens: {len(self.data):,}")
    
    def __len__(self):
        return max(0, (len(self.data) - 1) // self.block_size)
    
    def __getitem__(self, idx):
        start = idx * self.block_size
        end = start + self.block_size
        x = self.data[start:end]
        y = self.data[start + 1:end + 1]
        return x, y

class DataLoaderFromFile:
    """Load dataset from text files"""
    def __init__(self, file_path, tokenizer, block_size, batch_size, shuffle=True):
        self.file_path = Path(file_path)
        self.tokenizer = tokenizer
        self.block_size = block_size
        self.batch_size = batch_size
        self.shuffle = shuffle
        
    def load_texts(self, max_samples=None):
        """Load texts from file with Windows encoding handling"""
        if not self.file_path.exists():
            print(f"Warning: File {self.file_path} does not exist!")
            return []
            
        texts = []
        try:
            # Try different encodings for Windows compatibility
            with open(self.file_path, 'r', encoding='utf-8') as f:
                for i, line in enumerate(f):
                    if max_samples and i >= max_samples:
                        break
                    line = line.strip()
                    if line:
                        texts.append(line)
        except UnicodeDecodeError:
            # Fallback to latin-1 encoding
            with open(self.file_path, 'r', encoding='latin-1') as f:
                for i, line in enumerate(f):
                    if max_samples and i >= max_samples:
                        break
                    line = line.strip()
                    if line:
                        texts.append(line)
        return texts
    
    def create_dataloader(self, max_samples=None):
        """Create dataloader with Windows-safe settings"""
        texts = self.load_texts(max_samples)
        if not texts:
            print("No texts loaded! Please check your data file.")
            return None
            
        dataset = TextDataset(texts, self.tokenizer, self.block_size, max_samples)
        
        if len(dataset) == 0:
            print("Dataset is empty! Not enough tokens to create samples.")
            return None
        
        # On Windows, num_workers > 0 can cause issues with multiprocessing
        num_workers = 0 if sys.platform == 'win32' else 4
        
        dataloader = DataLoader(
            dataset,
            batch_size=self.batch_size,
            shuffle=self.shuffle,
            num_workers=num_workers,
            pin_memory=True if sys.platform != 'win32' else False,
            drop_last=True
        )
        
        return dataloader
# src/utils/tokenizer.py
import torch
from transformers import AutoTokenizer
import tiktoken
from typing import List, Union

class SimpleTokenizer:
    """Unified tokenizer wrapper"""
    def __init__(self, tokenizer_type="gpt2", vocab_size=None):
        self.tokenizer_type = tokenizer_type
        
        if tokenizer_type == "gpt2":
            self.tokenizer = tiktoken.get_encoding("gpt2")
            self.vocab_size = self.tokenizer.n_vocab
            self.eos_token_id = self.tokenizer.eot_token
            self.pad_token_id = 0
        elif tokenizer_type == "llama":
            self.tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")
            self.vocab_size = self.tokenizer.vocab_size
            self.eos_token_id = self.tokenizer.eos_token_id
            self.pad_token_id = self.tokenizer.pad_token_id
        else:
            # Try to load from HuggingFace
            self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_type)
            self.vocab_size = self.tokenizer.vocab_size
            self.eos_token_id = self.tokenizer.eos_token_id
            self.pad_token_id = self.tokenizer.pad_token_id
    
    def encode(self, text: str) -> List[int]:
        if isinstance(self.tokenizer, tiktoken.Encoding):
            return self.tokenizer.encode(text)
        return self.tokenizer.encode(text, add_special_tokens=False)
    
    def decode(self, tokens: Union[List[int], torch.Tensor]) -> str:
        if isinstance(tokens, torch.Tensor):
            tokens = tokens.tolist()
        if isinstance(self.tokenizer, tiktoken.Encoding):
            return self.tokenizer.decode(tokens)
        return self.tokenizer.decode(tokens, skip_special_tokens=True)
    
    def __len__(self):
        return self.vocab_size
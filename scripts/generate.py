# scripts/generate.py
import torch
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.model.transformer import ToyLLM
from src.utils.tokenizer import SimpleTokenizer
import argparse
import torch.nn.functional as F

class TextGenerator:
    def __init__(self, checkpoint_path, device='cuda'):
        # Load checkpoint with weights_only=False (trusted source)
        print(f"Loading model from {checkpoint_path}...")
        checkpoint = torch.load(checkpoint_path, map_location='cpu', weights_only=False)
        
        self.config = checkpoint['config']
        
        # Initialize model
        self.model = ToyLLM(self.config)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model = self.model.to(device)
        self.model.eval()
        
        # Initialize tokenizer
        self.tokenizer = SimpleTokenizer(tokenizer_type="gpt2")
        self.device = device
        
        print(f"Model loaded with {self.model.get_num_params():,} parameters")
    
    @torch.no_grad()
    def generate(self, prompt, max_length=100, temperature=0.8, top_k=50, top_p=0.95):
        """Generate text with multiple sampling strategies"""
        # Tokenize prompt
        input_ids = torch.tensor([self.tokenizer.encode(prompt)]).to(self.device)
        
        for _ in range(max_length):
            # Get predictions
            logits, _ = self.model(input_ids)
            logits = logits[:, -1, :] / temperature
            
            # Apply top-k filtering
            if top_k > 0:
                indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
                logits[indices_to_remove] = float('-inf')
            
            # Apply top-p (nucleus) filtering
            if top_p < 1.0:
                sorted_logits, sorted_indices = torch.sort(logits, descending=True)
                cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                
                sorted_indices_to_remove = cumulative_probs > top_p
                sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                sorted_indices_to_remove[..., 0] = 0
                
                indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
                logits[indices_to_remove] = float('-inf')
            
            # Sample next token
            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            
            # Append to sequence
            input_ids = torch.cat([input_ids, next_token], dim=1)
            
            # Stop if EOS token
            if next_token.item() == self.tokenizer.eos_token_id:
                break
        
        # Decode generated text
        generated_text = self.tokenizer.decode(input_ids[0].tolist())
        return generated_text

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=str, required=True)
    parser.add_argument("--prompt", type=str, default="Once upon a time")
    parser.add_argument("--max-length", type=int, default=200)
    parser.add_argument("--temperature", type=float, default=0.8)
    parser.add_argument("--top-k", type=int, default=50)
    parser.add_argument("--top-p", type=float, default=0.95)
    args = parser.parse_args()
    
    # Set device
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Create generator
    generator = TextGenerator(args.checkpoint, device)
    
    # Generate
    generated = generator.generate(
        args.prompt,
        max_length=args.max_length,
        temperature=args.temperature,
        top_k=args.top_k,
        top_p=args.top_p
    )
    
    print("\n" + "="*50)
    print("Generated Text:")
    print("="*50)
    print(generated)

if __name__ == "__main__":
    main()
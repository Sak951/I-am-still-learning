# scripts/fetch_data.py
import os
import sys
sys.path.append('.')
from datasets import load_dataset
from sklearn.model_selection import train_test_split
from pathlib import Path
import json
import argparse
from tqdm import tqdm

class DataFetcher:
    def __init__(self, output_dir="data/raw", processed_dir="data/processed"):
        self.output_dir = Path(output_dir)
        self.processed_dir = Path(processed_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
    
    def fetch_tiny_textbooks(self, max_samples=10000):
        """Fetch tiny-textbooks dataset for quick prototyping"""
        print("Fetching TinyTextbooks dataset...")
        dataset = load_dataset("nampdn-ai/tiny-textbooks", split="train")
        
        if max_samples:
            dataset = dataset.select(range(min(max_samples, len(dataset))))
        
        texts = []
        for item in tqdm(dataset, desc="Processing"):
            text = item.get("text", "")
            if text and len(text) > 100:
                texts.append(text)
        
        return self._prepare_and_save(texts, "tiny-textbooks")
    
    def fetch_slim_pajama_sample(self, max_samples=50000):
        """Fetch a sample of SlimPajama dataset"""
        print("Fetching SlimPajama sample...")
        dataset = load_dataset(
            "cerebras/SlimPajama-627B", 
            split="train",
            streaming=True
        )
        
        texts = []
        for i, item in enumerate(tqdm(dataset, desc="Processing", total=max_samples)):
            if i >= max_samples:
                break
            text = item.get("text", "")
            if text and len(text) > 100:
                texts.append(text)
        
        return self._prepare_and_save(texts, "slim-pajama-sample")
    
    def fetch_wikipedia(self, lang="en", max_articles=10000):
        """Fetch Wikipedia articles"""
        print(f"Fetching Wikipedia ({lang})...")
        dataset = load_dataset("wikipedia", f"20220301.{lang}", split="train")
        
        if max_articles:
            dataset = dataset.select(range(min(max_articles, len(dataset))))
        
        texts = []
        for item in tqdm(dataset, desc="Processing"):
            text = item.get("text", "")
            if text and len(text) > 500:  # Filter short articles
                texts.append(text)
        
        return self._prepare_and_save(texts, f"wikipedia-{lang}")
    
    def fetch_c4_sample(self, max_docs=10000):
        """Fetch a sample of C4 dataset"""
        print("Fetching C4 sample...")
        dataset = load_dataset("allenai/c4", "en", split="train", streaming=True)
        
        texts = []
        for i, item in enumerate(tqdm(dataset, desc="Processing", total=max_docs)):
            if i >= max_docs:
                break
            text = item.get("text", "")
            if text and len(text) > 200:
                texts.append(text)
        
        return self._prepare_and_save(texts, "c4-sample")
    
    def fetch_code_dataset(self, max_samples=10000):
        """Fetch code dataset from StarCoder"""
        print("Fetching StarCoder sample...")
        dataset = load_dataset(
            "bigcode/starcoderdata", 
            "python",
            split="train",
            streaming=True
        )
        
        texts = []
        for i, item in enumerate(tqdm(dataset, desc="Processing", total=max_samples)):
            if i >= max_samples:
                break
            text = item.get("content", "")
            if text and len(text) > 100:
                texts.append(text)
        
        return self._prepare_and_save(texts, "starcoder-python")
    
    def _prepare_and_save(self, texts, name):
        """Split and save dataset"""
        # Split into train/val
        train_size = int(0.98 * len(texts))
        train_texts = texts[:train_size]
        val_texts = texts[train_size:]
        
        # Save to files
        train_path = self.processed_dir / f"{name}_train.txt"
        val_path = self.processed_dir / f"{name}_val.txt"
        
        with open(train_path, "w", encoding="utf-8") as f:
            for text in train_texts:
                f.write(text + "\n\n")
        
        with open(val_path, "w", encoding="utf-8") as f:
            for text in val_texts:
                f.write(text + "\n\n")
        
        # Save metadata
        metadata = {
            "name": name,
            "total_samples": len(texts),
            "train_samples": len(train_texts),
            "val_samples": len(val_texts),
            "train_file": str(train_path),
            "val_file": str(val_path)
        }
        
        with open(self.processed_dir / f"{name}_metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Saved {len(train_texts)} train, {len(val_texts)} val samples to {self.processed_dir}")
        return train_texts, val_texts

def main():
    parser = argparse.ArgumentParser(description="Fetch datasets for toy LLM")
    parser.add_argument("--dataset", type=str, default="tiny-textbooks",
                        choices=["tiny-textbooks", "slim-pajama", "wikipedia", "c4", "code"])
    parser.add_argument("--max-samples", type=int, default=10000,
                        help="Maximum number of samples to fetch")
    parser.add_argument("--lang", type=str, default="en",
                        help="Language for Wikipedia")
    
    args = parser.parse_args()
    
    fetcher = DataFetcher()
    
    if args.dataset == "tiny-textbooks":
        fetcher.fetch_tiny_textbooks(max_samples=args.max_samples)
    elif args.dataset == "slim-pajama":
        fetcher.fetch_slim_pajama_sample(max_samples=args.max_samples)
    elif args.dataset == "wikipedia":
        fetcher.fetch_wikipedia(lang=args.lang, max_articles=args.max_samples)
    elif args.dataset == "c4":
        fetcher.fetch_c4_sample(max_docs=args.max_samples)
    elif args.dataset == "code":
        fetcher.fetch_code_dataset(max_samples=args.max_samples)

if __name__ == "__main__":
    main()
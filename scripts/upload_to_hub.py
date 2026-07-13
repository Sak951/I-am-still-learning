# scripts/upload_to_hub.py
import torch
import os
import sys
import json
import shutil
from pathlib import Path
import argparse
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.model.transformer import ToyLLM
from src.model.config import ModelConfig
from src.utils.tokenizer import SimpleTokenizer


class HuggingFaceUploader:
    def __init__(self, checkpoint_path, model_name, username=None):
        self.checkpoint_path = checkpoint_path
        self.model_name = model_name
        self.username = username
        self.full_model_name = f"{username}/{model_name}" if username else model_name

        # Load checkpoint
        print(f"Loading checkpoint from {checkpoint_path}...")
        self.checkpoint = torch.load(checkpoint_path, map_location='cpu', weights_only=False)
        self.config = self.checkpoint['config']

        # Get model info
        self.model = ToyLLM(self.config)
        self.model.load_state_dict(self.checkpoint['model_state_dict'])
        self.num_params = self.model.get_num_params()

        # Create output directory
        self.output_dir = Path(f"./hf_models/{model_name}")
        if self.output_dir.exists():
            shutil.rmtree(self.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        print(f"Model has {self.num_params:,} parameters")
        print(f"Output directory: {self.output_dir}")

    def save_model_files(self):
        """Save model weights and configuration"""
        print("\n📁 Saving model files...")

        # Save model weights
        torch.save(
            self.checkpoint['model_state_dict'],
            self.output_dir / "pytorch_model.bin"
        )
        print("  ✓ Saved pytorch_model.bin")

        # Save config in Hugging Face format
        config_dict = {
            "architectures": ["ToyLLM"],
            "model_type": "toy-llm",
            "vocab_size": self.config.vocab_size,
            "max_position_embeddings": self.config.block_size,
            "hidden_size": self.config.n_embd,
            "num_attention_heads": self.config.n_head,
            "num_hidden_layers": self.config.n_layer,
            "intermediate_size": self.config.n_embd * 4,
            "hidden_dropout_prob": self.config.dropout,
            "attention_probs_dropout_prob": self.config.dropout,
            "torch_dtype": "float32",
            "transformers_version": "4.30.0"
        }

        with open(self.output_dir / "config.json", "w") as f:
            json.dump(config_dict, f, indent=2)
        print("  ✓ Saved config.json")

        # Create tokenizer files
        tokenizer = SimpleTokenizer(tokenizer_type="gpt2")

        # Save tokenizer config
        tokenizer_config = {
            "tokenizer_class": "GPT2Tokenizer",
            "vocab_size": tokenizer.vocab_size,
            "model_max_length": self.config.block_size
        }

        with open(self.output_dir / "tokenizer_config.json", "w") as f:
            json.dump(tokenizer_config, f, indent=2)

        print("  ✓ Saved tokenizer files")

        return self.output_dir

    def create_model_card(self):
        """Create a comprehensive README.md model card"""
        print("\n📝 Creating model card...")

        train_loss = self.checkpoint.get('best_val_loss', 'N/A')

        # NOTE: The card_content is built by concatenation to avoid the SyntaxError
        # caused by triple-quoted backtick code blocks inside a triple-quoted f-string.
        card_content = (
            f"""---
language: en
license: mit
tags:
- toy-llm
- text-generation
- pytorch
- educational
datasets:
- tiny-textbooks
- wikipedia
widget:
- text: "The benefits of renewable energy include"
  example_title: "Renewable Energy"
- text: "Machine learning algorithms work by"
  example_title: "Machine Learning"
- text: "The process of photosynthesis involves"
  example_title: "Photosynthesis"
---

# I am still learning

## Model Description

This is a toy language model trained from scratch for educational purposes.

**Model Type:** Causal Language Model
**Architecture:** Transformer decoder-only
**Parameters:** {self.num_params:,}
**Context Length:** {self.config.block_size} tokens
**Vocabulary Size:** {self.config.vocab_size}

## Training Details

### Architecture
- **Layers:** {self.config.n_layer}
- **Hidden Size:** {self.config.n_embd}
- **Attention Heads:** {self.config.n_head}
- **Dropout:** {self.config.dropout}

### Training Configuration
- **Batch Size:** {self.config.batch_size}
- **Learning Rate:** {self.config.learning_rate}
- **Optimizer:** AdamW
- **Final Loss:** {train_loss}

## Usage

### Quick Start

"""
            + "```python\n"
            + """import torch
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("Sak2004/I-am-still-learning", trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained("Sak2004/I-am-still-learning")

inputs = tokenizer("The benefits of renewable energy include", return_tensors="pt")
with torch.no_grad():
    outputs = model.generate(inputs.input_ids, max_length=100, temperature=0.8)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
"""
            + "```\n"
            + f"""
## Limitations

- This is an educational/toy model and is not intended for production use.
- Generated text may be incoherent or factually incorrect.
- Trained on a limited dataset; performance is expected to be modest.

## License

This model is released under the MIT License.

## Citation

If you use this model, please cite:

```
@misc{{toyllm_{datetime.now().year},
  title={{I am still learning - A Toy Language Model}},
  author={{Sak2004}},
  year={{{datetime.now().year}}},
  url={{https://huggingface.co/Sak2004/I-am-still-learning}}
}}
```
"""
        )

        readme_path = self.output_dir / "README.md"
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(card_content)

        print("  ✓ Saved README.md (model card)")
        return readme_path

    def upload(self):
        """Upload model to Hugging Face Hub"""
        try:
            from huggingface_hub import HfApi, login
        except ImportError:
            raise ImportError(
                "huggingface_hub is not installed. Run: pip install huggingface_hub"
            )

        print("\n🚀 Uploading to Hugging Face Hub...")

        api = HfApi()

        # Create repo if it doesn't exist
        try:
            api.create_repo(
                repo_id=self.full_model_name,
                repo_type="model",
                exist_ok=True,
            )
            print(f"  ✓ Repository ready: {self.full_model_name}")
        except Exception as e:
            print(f"  ⚠ Could not create repo: {e}")

        # Upload all files in output_dir
        api.upload_folder(
            folder_path=str(self.output_dir),
            repo_id=self.full_model_name,
            repo_type="model",
        )

        print(f"  ✓ Upload complete!")
        print(f"  🔗 https://huggingface.co/{self.full_model_name}")

    def run(self):
        """Run the full pipeline: save files, create model card, upload"""
        self.save_model_files()
        self.create_model_card()
        self.upload()
        print("\n✅ All done!")


def main():
    parser = argparse.ArgumentParser(description="Upload ToyLLM checkpoint to Hugging Face Hub")
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to .pt checkpoint file")
    parser.add_argument("--model-name", type=str, required=True, help="Model name on the Hub")
    parser.add_argument("--username", type=str, default=None, help="Hugging Face username")
    parser.add_argument("--token", type=str, default=None, help="Hugging Face API token")
    args = parser.parse_args()

    if args.token:
        from huggingface_hub import login
        login(token=args.token)

    uploader = HuggingFaceUploader(
        checkpoint_path=args.checkpoint,
        model_name=args.model_name,
        username=args.username,
    )
    uploader.run()


if __name__ == "__main__":
    main()
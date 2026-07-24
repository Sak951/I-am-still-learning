# app.py
# Entrypoint for Hugging Face Spaces (Gradio SDK workaround).
# This script boots the Flask API backend on port 7860.

import os
import sys

# Add project root to Python search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import torch
from scripts.web_demo import app, WebGenerator
import scripts.web_demo as web_demo

# Fetch model checkpoint path (fallback to your public Hugging Face model URL)
checkpoint_path = os.environ.get(
    "CHECKPOINT_PATH",
    "https://huggingface.co/Sak2004/I-am-still-learning/resolve/main/pytorch_model.bin"
)

# Determine execution device
device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"🚀 Initializing WebGenerator with model path: {checkpoint_path}...")
# Inject generator into web_demo module namespace
web_demo.generator = WebGenerator(checkpoint_path, device)

if __name__ == "__main__":
    print("✨ Starting Flask model backend on port 7860...")
    # Hugging Face Spaces routes web requests to port 7860
    app.run(host="0.0.0.0", port=7860)

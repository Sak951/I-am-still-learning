# scripts/download_model.py
import os
import urllib.request

def download():
    checkpoint_path = "https://huggingface.co/Sak2004/I-am-still-learning/resolve/main/model_quant.onnx"
    local_dir = "checkpoints"
    os.makedirs(local_dir, exist_ok=True)
    local_path = os.path.join(local_dir, "downloaded_model.onnx")
    
    # Skip if already exists and is complete
    if os.path.exists(local_path) and os.path.getsize(local_path) > 10 * 1024 * 1024:
        print("Model already exists locally. Skipping download.")
        return
        
    print(f"Downloading model from {checkpoint_path} to {local_path}...")
    req = urllib.request.Request(checkpoint_path)
    hf_token = os.environ.get("HF_TOKEN")
    if hf_token:
        req.add_header("Authorization", f"Bearer {hf_token}")
        
    try:
        with urllib.request.urlopen(req) as response, open(local_path, 'wb') as out_file:
            while True:
                chunk = response.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                out_file.write(chunk)
        print("✅ Model downloaded successfully during build phase!")
    except Exception as e:
        print(f"❌ Failed to download model during build: {e}")
        # Re-raise so build fails rather than deploying a broken container
        raise e

if __name__ == "__main__":
    download()

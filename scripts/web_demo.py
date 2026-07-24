# scripts/web_demo.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify, render_template_string
import argparse

app = Flask(__name__)

# Global generator
generator = None

class WebGenerator:
    def __init__(self, checkpoint_path, device='cpu'):
        self.device = device
        self.tokenizer = None
        
        from src.utils.tokenizer import SimpleTokenizer
        self.tokenizer = SimpleTokenizer(tokenizer_type="gpt2")
        
        # Check if the checkpoint is an ONNX model
        self.is_onnx = "model_quant.onnx" in checkpoint_path or checkpoint_path.endswith(".onnx")
        
        if self.is_onnx:
            print("ONNX model detected.")
            if checkpoint_path.startswith("http://") or checkpoint_path.startswith("https://"):
                import urllib.request
                local_dir = "checkpoints"
                os.makedirs(local_dir, exist_ok=True)
                local_path = os.path.join(local_dir, "downloaded_model.onnx")
                
                print(f"Downloading ONNX checkpoint from {checkpoint_path} to {local_path} in chunks...")
                req = urllib.request.Request(checkpoint_path)
                hf_token = os.environ.get("HF_TOKEN")
                if hf_token:
                    req.add_header("Authorization", f"Bearer {hf_token}")
                    
                with urllib.request.urlopen(req) as response, open(local_path, 'wb') as out_file:
                    while True:
                        chunk = response.read(1024 * 1024)  # 1MB chunks
                        if not chunk:
                            break
                        out_file.write(chunk)
                print("Download completed.")
                checkpoint_path = local_path
            
            print(f"Loading ONNX Session from {checkpoint_path}...")
            import onnxruntime as ort
            self.session = ort.InferenceSession(checkpoint_path, providers=['CPUExecutionProvider'])
            print("ONNX Session loaded successfully.")
            return
            
        # Below is PyTorch-specific loading logic (only imported if not ONNX)
        import torch
        from src.model.transformer import ToyLLM
        
        checkpoint = None
        
        if checkpoint_path.startswith("http://") or checkpoint_path.startswith("https://"):
            import urllib.request
            local_dir = "checkpoints"
            os.makedirs(local_dir, exist_ok=True)
            local_path = os.path.join(local_dir, "downloaded_model.pt")
            
            print(f"Downloading checkpoint from {checkpoint_path} to {local_path} in chunks...")
            req = urllib.request.Request(checkpoint_path)
            hf_token = os.environ.get("HF_TOKEN")
            if hf_token:
                req.add_header("Authorization", f"Bearer {hf_token}")
                
            with urllib.request.urlopen(req) as response, open(local_path, 'wb') as out_file:
                while True:
                    chunk = response.read(1024 * 1024)  # 1MB chunks
                    if not chunk:
                        break
                    out_file.write(chunk)
                    
            print("Download completed. Loading checkpoint...")
            checkpoint = torch.load(local_path, map_location='cpu', weights_only=False, mmap=True)
            checkpoint_path = local_path
        else:
            print(f"Loading model from {checkpoint_path}...")
            checkpoint = torch.load(checkpoint_path, map_location='cpu', weights_only=False, mmap=True)
            
        # Check if the loaded checkpoint is a full checkpoint dictionary or weights-only state_dict
        is_full_checkpoint = isinstance(checkpoint, dict) and 'config' in checkpoint and 'model_state_dict' in checkpoint
        
        if is_full_checkpoint:
            self.config = checkpoint['config']
            state_dict = checkpoint['model_state_dict']
        else:
            # It is a weights-only state dict (e.g. pytorch_model.bin)
            state_dict = checkpoint
            
            # Resolve config
            config_loaded = False
            # Option A: If downloaded from URL, we can fetch config.json from HF
            if checkpoint_path.endswith("downloaded_model.pt") and os.environ.get("CHECKPOINT_PATH"):
                checkpoint_url = os.environ.get("CHECKPOINT_PATH")
                if "pytorch_model.bin" in checkpoint_url:
                    config_url = checkpoint_url.replace("pytorch_model.bin", "config.json")
                    try:
                        print(f"Fetching remote model configuration from {config_url}...")
                        import json
                        req_config = urllib.request.Request(config_url)
                        hf_token = os.environ.get("HF_TOKEN")
                        if hf_token:
                            req_config.add_header("Authorization", f"Bearer {hf_token}")
                        with urllib.request.urlopen(req_config) as response:
                            config_data = json.loads(response.read().decode())
                        
                        from src.model.config import ModelConfig
                        self.config = ModelConfig(
                            vocab_size=config_data.get("vocab_size", 50257),
                            block_size=config_data.get("max_position_embeddings", 1024),
                            n_embd=config_data.get("hidden_size", 768),
                            n_head=config_data.get("num_attention_heads", 12),
                            n_layer=config_data.get("num_hidden_layers", 12),
                            dropout=config_data.get("hidden_dropout_prob", 0.1)
                        )
                        config_loaded = True
                        print("Successfully loaded remote configuration.")
                    except Exception as config_err:
                        print(f"Failed to fetch remote config: {config_err}")
            
            # Option B: Fallback to base_config.yaml locally
            if not config_loaded:
                try:
                    import yaml
                    from src.model.config import ModelConfig
                    config_path = "configs/base_config.yaml"
                    print(f"Loading fallback config from {config_path}...")
                    with open(config_path, 'r') as f:
                        yaml_config = yaml.safe_load(f)
                    model_params = yaml_config.get("model", {})
                    self.config = ModelConfig(
                        vocab_size=model_params.get("vocab_size", 50257),
                        block_size=model_params.get("block_size", 1024),
                        n_embd=model_params.get("n_embd", 768),
                        n_head=model_params.get("n_head", 12),
                        n_layer=model_params.get("n_layer", 12),
                        dropout=model_params.get("dropout", 0.1)
                    )
                    config_loaded = True
                except Exception as fallback_err:
                    print(f"Failed to load fallback config: {fallback_err}")
                    raise ValueError("Could not load configuration for weights-only model.")
        
        # Set default dtype to bfloat16 on CPU during instantiation to avoid float32 allocation spike
        if device == 'cpu':
            torch.set_default_dtype(torch.bfloat16)
            
        self.model = ToyLLM(self.config)
        
        if device == 'cpu':
            torch.set_default_dtype(torch.float32)
            
        # Pop and copy weights one-by-one in-place to avoid memory duplication
        print("Loading weights into model layers one-by-one...")
        with torch.no_grad():
            # Copy Parameters
            for name, param in list(self.model.named_parameters()):
                if name in state_dict:
                    val = state_dict.pop(name)
                    if val.dtype == torch.float32:
                        param.copy_(val.to(torch.bfloat16))
                    else:
                        param.copy_(val)
                    del val
            
            # Copy Buffers (if any)
            for name, buf in list(self.model.named_buffers()):
                if name in state_dict:
                    val = state_dict.pop(name)
                    if val.dtype == torch.float32:
                        buf.copy_(val.to(torch.bfloat16))
                    else:
                        buf.copy_(val)
                    del val
        
        if len(state_dict) > 0:
            print(f"Warning: The following keys in checkpoint were not loaded: {list(state_dict.keys())}")
            
        self.model = self.model.to(device)
        self.model.eval()
        
        # Delete downloaded file immediately to free RAM overlay page cache!
        if checkpoint_path.endswith("downloaded_model.pt") and os.path.exists(checkpoint_path):
            try:
                os.remove(checkpoint_path)
                print("Deleted downloaded checkpoint file to free RAM page cache.")
            except Exception as e:
                print(f"Failed to delete checkpoint file: {e}")
        
        # Free memory immediately
        del state_dict
        del checkpoint
        import gc
        gc.collect()
        
        print(f"Model loaded with {self.model.get_num_params():,} parameters")
    
    def generate(self, prompt, max_length=150, temperature=0.8, top_k=50, top_p=0.95, repetition_penalty=1.25):
        if self.is_onnx:
            import numpy as np
            input_ids = self.tokenizer.encode(prompt)
            
            for _ in range(max_length):
                # Shape expected: [batch_size, seq_len]
                inp = np.array([input_ids], dtype=np.int64)
                outputs = self.session.run(None, {"input_ids": inp})
                # Slice last logits: shape [vocab_size]
                logits = outputs[0][0, -1, :].astype(np.float64) / temperature
                
                # Apply repetition penalty
                if repetition_penalty != 1.0:
                    generated_tokens = set(input_ids)
                    for token_id in generated_tokens:
                        val = logits[token_id]
                        if val > 0:
                            logits[token_id] /= repetition_penalty
                        else:
                            logits[token_id] *= repetition_penalty
                            
                # Apply Top-K filtering
                if top_k > 0:
                    top_k_indices = np.argpartition(logits, -top_k)[-top_k:]
                    min_val = logits[top_k_indices].min()
                    logits[logits < min_val] = float('-inf')
                    
                # Apply Top-P (Nucleus) filtering
                if top_p < 1.0:
                    sorted_indices = np.argsort(logits)[::-1]
                    sorted_logits = logits[sorted_indices]
                    
                    # Compute softmax probabilities
                    exp_logits = np.exp(sorted_logits - np.max(sorted_logits))
                    probs = exp_logits / np.sum(exp_logits)
                    cumulative_probs = np.cumsum(probs)
                    
                    idx_to_remove = cumulative_probs > top_p
                    idx_to_remove[1:] = idx_to_remove[:-1]
                    idx_to_remove[0] = False
                    
                    logits[sorted_indices[idx_to_remove]] = float('-inf')
                    
                # Final Softmax
                exp_logits = np.exp(logits - np.max(logits))
                probs = exp_logits / np.sum(exp_logits)
                
                # Sample next token
                next_token = np.random.choice(len(probs), p=probs)
                input_ids.append(int(next_token))
                
                if next_token == self.tokenizer.eos_token_id:
                    break
                    
            return self.tokenizer.decode(input_ids)
            
        else:
            import torch
            import torch.nn.functional as F
            input_ids = torch.tensor([self.tokenizer.encode(prompt)]).to(self.device)
            
            with torch.no_grad():
                for _ in range(max_length):
                    logits, _ = self.model(input_ids)
                    logits = logits[:, -1, :].float() / temperature
                    
                    # Apply repetition penalty to break infinite loops
                    if repetition_penalty != 1.0:
                        generated_tokens = set(input_ids[0].tolist())
                        for token_id in generated_tokens:
                            val = logits[0, token_id].item()
                            if val > 0:
                                logits[0, token_id] /= repetition_penalty
                            else:
                                logits[0, token_id] *= repetition_penalty
                    
                    if top_k > 0:
                        indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
                        logits[indices_to_remove] = float('-inf')
                    
                    if top_p < 1.0:
                        sorted_logits, sorted_indices = torch.sort(logits, descending=True)
                        cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                        sorted_indices_to_remove = cumulative_probs > top_p
                        sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                        sorted_indices_to_remove[..., 0] = 0
                        indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
                        logits[indices_to_remove] = float('-inf')
                    
                    probs = F.softmax(logits, dim=-1)
                    next_token = torch.multinomial(probs, num_samples=1)
                    input_ids = torch.cat([input_ids, next_token], dim=1)
                    
                    if next_token.item() == self.tokenizer.eos_token_id:
                        break
                
            return self.tokenizer.decode(input_ids[0].tolist())

# HTML Template
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Toy LLM Text Generator</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 0.9em;
        }
        textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            font-family: inherit;
            resize: vertical;
        }
        textarea:focus {
            outline: none;
            border-color: #007bff;
        }
        .controls {
            margin: 20px 0;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        .control-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .control-group label {
            font-size: 14px;
            color: #555;
        }
        input[type="range"] {
            width: 150px;
        }
        input[type="number"] {
            width: 60px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #0056b3;
        }
        .output {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #007bff;
            white-space: pre-wrap;
            font-family: monospace;
            line-height: 1.5;
        }
        .loading {
            display: none;
            color: #666;
            margin-top: 10px;
            font-style: italic;
        }
        .error {
            color: #dc3545;
            margin-top: 10px;
        }
        .example-prompts {
            margin-top: 20px;
            padding: 15px;
            background: #e9ecef;
            border-radius: 5px;
        }
        .example-prompts h3 {
            margin-top: 0;
            font-size: 14px;
            color: #555;
        }
        .example {
            display: inline-block;
            background: white;
            padding: 5px 10px;
            margin: 5px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            border: 1px solid #ddd;
        }
        .example:hover {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }
        .stats {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 I am still learning LLM Text Generator</h1>
        <div class="subtitle">A 30M parameter language model trained on textbook data</div>
        
        <form id="generate-form">
            <textarea id="prompt" rows="4" placeholder="Enter your prompt here... e.g., The benefits of renewable energy include"></textarea>
            
            <div class="controls">
                <div class="control-group">
                    <label>Temperature:</label>
                    <input type="range" id="temperature" min="0.5" max="1.5" step="0.05" value="0.8">
                    <span id="temp-value">0.80</span>
                </div>
                <div class="control-group">
                    <label>Max Length:</label>
                    <input type="number" id="max-length" min="50" max="300" value="150">
                </div>
                <div class="control-group">
                    <label>Top-K:</label>
                    <input type="number" id="top-k" min="0" max="100" value="50">
                </div>
                <div class="control-group">
                    <label>Top-P:</label>
                    <input type="range" id="top-p" min="0.5" max="1.0" step="0.01" value="0.95">
                    <span id="top-p-value">0.95</span>
                </div>
            </div>
            
            <button type="submit">Generate Text</button>
        </form>
        
        <div id="loading" class="loading">Generating... This may take a few seconds.</div>
        <div id="error" class="error"></div>
        
        <div id="output" class="output" style="display:none;"></div>
        
        <div class="example-prompts">
            <h3>📝 Example Prompts (click to try):</h3>
            <div class="example" data-prompt="The benefits of renewable energy include">🌱 Renewable energy</div>
            <div class="example" data-prompt="Machine learning algorithms work by">🤖 Machine learning</div>
            <div class="example" data-prompt="The process of photosynthesis involves">🌿 Photosynthesis</div>
            <div class="example" data-prompt="Climate change mitigation strategies include">🌍 Climate change</div>
            <div class="example" data-prompt="The advantages of cloud computing are">☁️ Cloud computing</div>
            <div class="example" data-prompt="Artificial intelligence can be used for">🧠 AI applications</div>
        </div>
        
        <div class="stats">
            ⚡ Model: 30M parameters | Trained on textbook data | Overfitting warning: may repeat phrases
        </div>
    </div>
    
    <script>
        // Update temperature display
        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temp-value');
        tempSlider.oninput = () => tempValue.textContent = parseFloat(tempSlider.value).toFixed(2);
        
        const topPSlider = document.getElementById('top-p');
        const topPValue = document.getElementById('top-p-value');
        topPSlider.oninput = () => topPValue.textContent = parseFloat(topPSlider.value).toFixed(2);
        
        // Handle form submission
        const form = document.getElementById('generate-form');
        const outputDiv = document.getElementById('output');
        const loadingDiv = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const prompt = document.getElementById('prompt').value.trim();
            if (!prompt) {
                errorDiv.textContent = 'Please enter a prompt';
                return;
            }
            
            // Hide previous output, show loading
            outputDiv.style.display = 'none';
            loadingDiv.style.display = 'block';
            errorDiv.textContent = '';
            
            const data = {
                prompt: prompt,
                temperature: parseFloat(tempSlider.value),
                max_length: parseInt(document.getElementById('max-length').value),
                top_k: parseInt(document.getElementById('top-k').value),
                top_p: parseFloat(topPSlider.value)
            };
            
            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                outputDiv.textContent = result.generated_text;
                outputDiv.style.display = 'block';
            } catch (err) {
                errorDiv.textContent = 'Error: ' + err.message;
            } finally {
                loadingDiv.style.display = 'none';
            }
        };
        
        // Handle example clicks
        document.querySelectorAll('.example').forEach(el => {
            el.onclick = () => {
                document.getElementById('prompt').value = el.dataset.prompt;
                form.dispatchEvent(new Event('submit'));
            };
        });
    </script>
</body>
</html>
'''

import threading

def load_generator_bg(checkpoint_path, device):
    try:
        print(f"Starting background generator loading for checkpoint: {checkpoint_path}...")
        gen = WebGenerator(checkpoint_path, device)
        app.config['GENERATOR'] = gen
        print("Generator successfully loaded in background.")
    except Exception as e:
        print(f"Error loading generator in background: {e}")

# Auto-initialize if running under WSGI (like Gunicorn)
env_checkpoint = os.environ.get("CHECKPOINT_PATH")
if env_checkpoint:
    try:
        import torch
        has_cuda = torch.cuda.is_available()
    except ImportError:
        has_cuda = False
    device = "cuda" if has_cuda else "cpu"
    
    # Run initialization in a background thread to prevent Gunicorn worker timeout
    threading.Thread(target=load_generator_bg, args=(env_checkpoint, device), daemon=True).start()

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

@app.route('/generate', methods=['POST'])
def generate():
    try:
        generator = app.config.get('GENERATOR')
        if generator is None:
            return jsonify({'error': 'Model is still loading in the background. Please retry in a few seconds.'}), 503
            
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        prompt = data.get('prompt', '')
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        temperature = data.get('temperature', 0.8)
        max_length = data.get('max_length', 150)
        top_k = data.get('top_k', 50)
        top_p = data.get('top_p', 0.95)
        repetition_penalty = data.get('repetition_penalty', 1.25)
        
        # Generate text
        generated = generator.generate(
            prompt,
            max_length=max_length,
            temperature=temperature,
            top_k=top_k,
            top_p=top_p,
            repetition_penalty=repetition_penalty
        )
        
        return jsonify({'generated_text': generated})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    generator = app.config.get('GENERATOR')
    is_loaded = False
    if generator is not None:
        if generator.is_onnx:
            is_loaded = hasattr(generator, 'session') and generator.session is not None
        else:
            is_loaded = hasattr(generator, 'model') and generator.model is not None
            
    return jsonify({
        'status': 'healthy',
        'model_loaded': is_loaded
    })

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint', type=str, required=True)
    parser.add_argument('--port', type=int, default=5000)
    parser.add_argument('--host', type=str, default='127.0.0.1')
    args = parser.parse_args()
    
    try:
        import torch
        has_cuda = torch.cuda.is_available()
    except ImportError:
        has_cuda = False
    device = "cuda" if has_cuda else "cpu"
    app.config['GENERATOR'] = WebGenerator(args.checkpoint, device)
    
    print(f"\n✨ Web demo running at http://{args.host}:{args.port}")
    print("Press CTRL+C to stop\n")
    
    app.run(debug=True, host=args.host, port=args.port)

if __name__ == '__main__':
    main()
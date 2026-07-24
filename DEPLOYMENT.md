# 🚀 Deploying Learn OS to Render

This guide walks you through deploying the **I-am-still-learning** 124M parameter model backend and the Next.js frontend to **Render** using the provided `render.yaml` Blueprint.

---

## Prerequisites

1. A **[Render Account](https://render.com/)** connected to your GitHub repository.
2. A **[Hugging Face Account](https://huggingface.co/)** to host your model weights.
3. Your Git repository pushed to GitHub (make sure `render.yaml` and code modifications are pushed).

---

## Step 1: Export and Upload Quantized ONNX Model to Hugging Face

To run the model backend within Render's Free tier limit (512MB RAM), we export the PyTorch model to ONNX format and dynamically quantize it to 8-bit integers (INT8). This reduces the model size from 496MB to **155MB** and cuts RAM usage during inference from **997MB** to **220MB**!

We have already generated the quantized model (`checkpoints/model_quant.onnx`) and uploaded it to your Hugging Face Hub repository (`Sak2004/I-am-still-learning`).

If you ever need to recreate or re-upload the quantized model:
1. Run the local export script to generate `checkpoints/model.onnx`:
   ```bash
   python scratch/test_onnx.py
   ```
2. Run the dynamic quantization script to generate `checkpoints/model_quant.onnx`:
   ```bash
   python scratch/quantize.py
   ```
3. Upload the quantized model to your Hugging Face Hub repository:
   ```bash
   python scripts/upload_onnx.py --token <YOUR_HF_TOKEN>
   ```

---

## Step 2: Deploy using Render Blueprints

Render's Blueprints read the `render.yaml` file in your repository root and automatically configure all services, connections, and env variables.

1. Log in to the **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository containing this project.
4. Name your Blueprint instance (e.g. `learn-os-deployment`).
5. Under **Environment Variables**, confirm or edit the `CHECKPOINT_PATH` and optionally set `HF_TOKEN`:
   * **Key**: `CHECKPOINT_PATH`
   * **Value**: `https://huggingface.co/Sak2004/I-am-still-learning/resolve/main/model_quant.onnx`
   * **Key**: `HF_TOKEN` (**Required if your Hugging Face repository is Private**)
   * **Value**: Your Hugging Face Read-only Access Token.
6. Click **Approve** / **Deploy**.

---

## How it works:
* **Model Backend (`learn-model-backend`)**: Render builds a Python container, downloads the quantized ONNX model from the `CHECKPOINT_PATH` URL, and boots a Gunicorn WSGI server. Since it uses `onnxruntime` instead of PyTorch, it loads the model and runs text generation using less than **200MB of RAM**!
* **Next.js Frontend (`learn-frontend`)**: Render builds the Node.js package inside `agent-ui`, automatically fetches the internal network host URL from the model service, binds it to the `BACKEND_URL` environment variable, and starts the Next.js server.

Both services will be online, linked, and ready for you to chat with your model!

---

## Alternative: Deploy Backend on Hugging Face Spaces (16GB RAM Free CPU Tier, No Card Required)

If you want more RAM (16GB vs Render's 512MB) for faster and more stable model loading, you can host the Python backend on Hugging Face Spaces and connect your Render frontend to it. This uses the **Gradio SDK** as a runner so it is 100% free and does **not** require credit card verification.

### Step A: Create the Hugging Face Space
1. Go to [Hugging Face](https://huggingface.co/) and click **New Space**.
2. Name your Space (e.g. `learn-model-backend`).
3. Select **Gradio** as the SDK (instead of Docker).
4. Choose the **Blank** template.
5. Set Space hardware to **CPU Basic (Free)**.
6. Set visibility to **Public** or **Private** (we recommend Public so your frontend can query it).
7. Click **Create Space**.

### Step B: Sync your Code
Hugging Face will provide a Git URL for the Space repository (e.g., `https://huggingface.co/spaces/Sak2004/learn-model-backend`).
1. Add the Space as a git remote in your local repository terminal:
   ```bash
   git remote add hf https://huggingface.co/spaces/Sak2004/learn-model-backend
   ```
2. Push your main branch to the Hugging Face Space (this uploads `app.py` and triggers the server build):
   ```bash
   git push hf main --force
   ```

### Step C: Configure Secrets on Hugging Face
1. In your Hugging Face Space, navigate to **Settings**.
2. Scroll to **Variables and secrets**.
3. Under **Repository secrets**, click **New secret** to add your Hugging Face token:
   * **Name**: `HF_TOKEN`
   * **Value**: Your Hugging Face read access token.
4. Click **New secret** to define the model checkpoint URL:
   * **Name**: `CHECKPOINT_PATH`
   * **Value**: `https://huggingface.co/Sak2004/I-am-still-learning/resolve/main/pytorch_model.bin`

### Step D: Connect Render Frontend to Hugging Face Space
Once the Space builds and shows a green **Running** status, copy the Direct URL:
* Direct URL format: `https://<username>-<space-name>.hf.space` (e.g. `https://sak2004-learn-model-backend.hf.space`).
1. In your **Render Dashboard**, select your Next.js Frontend (**`learn-frontend`**).
2. Go to **Environment**.
3. Edit the `BACKEND_URL` environment variable value to your Hugging Face Space Direct URL.
4. Click **Save Changes** and trigger a redeploy of the frontend!

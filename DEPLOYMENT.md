# 🚀 Deploying Learn OS to Render

This guide walks you through deploying the **I-am-still-learning** 124M parameter model backend and the Next.js frontend to **Render** using the provided `render.yaml` Blueprint.

---

## Prerequisites

1. A **[Render Account](https://render.com/)** connected to your GitHub repository.
2. A **[Hugging Face Account](https://huggingface.co/)** to host your model weights.
3. Your Git repository pushed to GitHub (make sure `render.yaml` and code modifications are pushed).

---

## Step 1: Upload Model Weights to Hugging Face

Because model checkpoints are too large for GitHub (over 300MB) and are excluded by `.gitignore`, you should upload your trained weights to the Hugging Face Hub so Render can download them dynamically during startup.

1. Ensure you have the `huggingface_hub` package installed and login via CLI:
   ```bash
   pip install huggingface_hub
   huggingface-cli login
   ```
2. Run the provided upload script to convert and push your best model weights (`checkpoints/best_model.pt`) to your Hugging Face repository (`Sak2004/I-am-still-learning`):
   ```bash
   python scripts/upload_to_hub.py --checkpoint checkpoints/best_model.pt --model_name I-am-still-learning --username Sak2004
   ```
3. Once uploaded, copy the direct download link for the model weights file (usually `pytorch_model.bin`). The link format will look like:
   `https://huggingface.co/Sak2004/I-am-still-learning/resolve/main/pytorch_model.bin`

---

## Step 2: Deploy using Render Blueprints

Render's Blueprints read the `render.yaml` file in your repository root and automatically configure all services, connections, and env variables.

1. Log in to the **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository containing this project.
4. Name your Blueprint instance (e.g. `learn-os-deployment`).
5. Under **Environment Variables**, confirm or edit the `CHECKPOINT_PATH`:
   * **Key**: `CHECKPOINT_PATH`
   * **Value**: Set this to the Hugging Face resolve URL copied in Step 1 (e.g., `https://huggingface.co/Sak2004/I-am-still-learning/resolve/main/pytorch_model.bin`).
6. Click **Approve** / **Deploy**.

---

## How it works:
* **Model Backend (`learn-model-backend`)**: Render builds a Python container, downloads the weight checkpoint from the `CHECKPOINT_PATH` URL into a local directory, and boots a Gunicorn WSGI server running the model inference engine.
* **Next.js Frontend (`learn-frontend`)**: Render builds the Node.js package inside `agent-ui`, automatically fetches the internal network host URL from the model service, binds it to the `BACKEND_URL` environment variable, and starts the Next.js server.

Both services will be online, linked, and ready for you to chat with your model!

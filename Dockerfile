# Dockerfile
# Production-ready container configuration for deploying the model backend to Hugging Face Spaces.
# Learn more at: https://huggingface.co/docs/hub/spaces-sdks-docker

FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860 \
    CHECKPOINT_PATH="https://huggingface.co/Sak2004/I-am-still-learning/resolve/main/pytorch_model.bin"

# Set working directory
WORKDIR /app

# Install basic system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to optimize Docker cache layers
COPY requirements-web.txt .

# Install dependencies (CPU PyTorch wheel to keep image build times fast and light)
RUN pip install --no-cache-dir -r requirements-web.txt

# Copy the rest of the project files
COPY . .

# Expose Hugging Face Space port
EXPOSE 7860

# Run Gunicorn WSGI server binding to HF's required port 7860
CMD ["gunicorn", "scripts.web_demo:app", "--bind", "0.0.0.0:7860", "--workers", "1", "--timeout", "120"]

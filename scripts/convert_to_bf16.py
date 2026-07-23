# scripts/convert_to_bf16.py
import torch
import os

def main():
    input_path = "checkpoints/finetuned/best_model.pt"
    output_path = "checkpoints/finetuned/best_model_bf16.pt"
    
    if not os.path.exists(input_path):
        input_path = "checkpoints/best_model.pt"
        output_path = "checkpoints/best_model_bf16.pt"
        
    if not os.path.exists(input_path):
        print(f"❌ Error: Could not find checkpoint at checkpoints/finetuned/best_model.pt or checkpoints/best_model.pt")
        return
        
    print(f"🔄 Loading checkpoint from {input_path}...")
    checkpoint = torch.load(input_path, map_location="cpu")
    
    print("⚡ Converting all floating-point model weights to bfloat16 precision...")
    state_dict = checkpoint["model_state_dict"]
    converted_count = 0
    for k, v in state_dict.items():
        if isinstance(v, torch.Tensor) and v.is_floating_point():
            state_dict[k] = v.to(torch.bfloat16)
            converted_count += 1
            
    print(f"💾 Saving bfloat16 checkpoint to {output_path} (this cuts model size in half)...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    torch.save(checkpoint, output_path)
    print("✅ Conversion complete! You are ready to upload the new bf16 checkpoint to Hugging Face.")

if __name__ == "__main__":
    main()

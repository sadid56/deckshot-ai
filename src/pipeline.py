import torch
from diffusers import (
    LTXImageToVideoPipeline,
    LTXPipeline,
    CogVideoXImageToVideoPipeline,
    CogVideoXPipeline,
)

def load_video_pipeline(model_name: str = "ltx", device: str = "mps", is_image_to_video: bool = True):
    """
    Load diffusion pipeline for either Image-to-Video or Text-to-Video generation.
    
    Args:
        model_name: 'ltx' or 'cogvideox'
        device: 'mps', 'cuda', or 'cpu'
        is_image_to_video: True for I2V (image provided), False for T2V (text prompt only)
    """
    model_name = model_name.lower()

    if model_name == "ltx":
        if is_image_to_video:
            print("[Pipeline] Loading Lightricks/LTX-Video (Image-to-Video)...")
            pipe = LTXImageToVideoPipeline.from_pretrained(
                "Lightricks/LTX-Video",
                torch_dtype=torch.bfloat16
            )
        else:
            print("[Pipeline] Loading Lightricks/LTX-Video (Text-to-Video)...")
            pipe = LTXPipeline.from_pretrained(
                "Lightricks/LTX-Video",
                torch_dtype=torch.bfloat16
            )
    elif model_name == "cogvideox":
        if is_image_to_video:
            print("[Pipeline] Loading THUDM/CogVideoX-5b-I2V (Image-to-Video)...")
            pipe = CogVideoXImageToVideoPipeline.from_pretrained(
                "THUDM/CogVideoX-5b-I2V",
                torch_dtype=torch.bfloat16
            )
        else:
            print("[Pipeline] Loading THUDM/CogVideoX-2b (Text-to-Video)...")
            pipe = CogVideoXPipeline.from_pretrained(
                "THUDM/CogVideoX-2b",
                torch_dtype=torch.bfloat16
            )
        pipe.vae.enable_slicing()
        pipe.vae.enable_tiling()
    else:
        raise ValueError(f"Unsupported model: '{model_name}'. Choose 'ltx' or 'cogvideox'.")

    # Apply memory offload for accelerators (MPS / CUDA)
    if device in ["cuda", "mps"]:
        print(f"[Pipeline] Enabling model CPU offload for {device.upper()} acceleration...")
        pipe.enable_model_cpu_offload()

    return pipe

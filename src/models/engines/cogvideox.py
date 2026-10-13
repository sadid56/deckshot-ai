from typing import Any, Optional
import torch
from diffusers import CogVideoXImageToVideoPipeline, CogVideoXPipeline
from src.models.base import BaseVideoModelEngine
from src.logger import logger


class CogVideoXEngine(BaseVideoModelEngine):
    """
    THUDM/CogVideoX Diffusion Model Engine.
    Heavyweight causal 3D VAE video model.
    """

    id = "cogvideox"
    name = "THUDM/CogVideoX-5B-I2V"
    description = "Large-scale 5B parameter DiT architecture with 3D VAE causal compression."
    recommended_hardware = "Dedicated GPU with 16GB+ VRAM (NVIDIA RTX 3090/4090, A100)"
    default_fps = 8
    default_steps = 30
    default_frames = 49
    guidance_scale = 6.0
    dependencies = ["diffusers", "transformers", "accelerate", "sentencepiece"]

    i2v_repo = "THUDM/CogVideoX-5b-I2V"
    t2v_repo = "THUDM/CogVideoX-2b"

    def download_weights(self, device: str = "cpu") -> None:
        logger.model(self.id, "Fetching model weights from Hugging Face...")
        logger.step(1, 2, f"Pre-caching Text-to-Video '{self.t2v_repo}'...")
        CogVideoXPipeline.from_pretrained(self.t2v_repo, dtype=torch.bfloat16)
        logger.step(2, 2, f"Pre-caching Image-to-Video '{self.i2v_repo}'...")
        CogVideoXImageToVideoPipeline.from_pretrained(self.i2v_repo, dtype=torch.bfloat16)
        logger.model(self.id, "Model weights cached locally.", level="success")

    def load_pipeline(self, device: str = "mps", is_image_to_video: bool = True) -> Any:
        dtype = torch.bfloat16
        repo = self.i2v_repo if is_image_to_video else self.t2v_repo
        mode = "Image-to-Video" if is_image_to_video else "Text-to-Video"
        logger.model(self.id, f"Loading {repo} ({mode})...")

        if is_image_to_video:
            pipe = CogVideoXImageToVideoPipeline.from_pretrained(self.i2v_repo, dtype=dtype)
        else:
            pipe = CogVideoXPipeline.from_pretrained(self.t2v_repo, dtype=dtype)

        pipe.vae.enable_slicing()
        pipe.vae.enable_tiling()

        if device == "cuda":
            logger.model(self.id, "Enabling model CPU offload for CUDA acceleration...")
            pipe.enable_model_cpu_offload(device="cuda")
        elif device == "mps":
            logger.model(self.id, "Configuring pipeline for Apple Silicon (MPS)...")
            try:
                pipe.enable_model_cpu_offload(device="mps")
            except Exception:
                pipe.to("mps")
        else:
            pipe.to("cpu")

        return pipe

    def generate(
        self,
        pipe: Any,
        prompt: str,
        negative_prompt: str,
        image: Optional[Any] = None,
        width: int = 704,
        height: int = 480,
        num_frames: int = 49,
        fps: int = 8,
        steps: int = 30,
        generator: Optional[torch.Generator] = None,
    ) -> Any:
        kwargs = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "num_frames": 49,
            "num_inference_steps": steps,
            "guidance_scale": self.guidance_scale,
            "generator": generator,
        }
        if image is not None:
            kwargs["image"] = image

        return pipe(**kwargs).frames[0]

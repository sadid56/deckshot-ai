from typing import Any, Optional
import torch
from diffusers import LTXImageToVideoPipeline, LTXPipeline
from src.models.base import BaseVideoModelEngine
from src.logger import logger


class LTXVideoEngine(BaseVideoModelEngine):
    """
    Lightricks/LTX-Video Diffusion Model Engine.
    High-fidelity 25 FPS generation with spatial-temporal DiT architecture.
    """

    id = "ltx"
    name = "Lightricks/LTX-Video (25 FPS - Recommended)"
    description = "State-of-the-art 25 FPS cinematic video diffusion. Fast, sharp, and highly optimized for consumer hardware."
    recommended_hardware = "Apple Silicon M1/M2/M3/M4 or NVIDIA GPU (12GB+ VRAM)"
    default_fps = 25
    default_steps = 30
    default_frames = 81
    guidance_scale = 3.0
    dependencies = ["diffusers", "transformers", "accelerate", "sentencepiece"]

    repo_id = "Lightricks/LTX-Video"

    def download_weights(self, device: str = "cpu") -> None:
        logger.model(self.id, f"Fetching model weights for '{self.repo_id}' from Hugging Face...")
        logger.step(1, 2, "Pre-caching Text-to-Video pipeline weights...")
        LTXPipeline.from_pretrained(self.repo_id, dtype=torch.bfloat16)
        logger.step(2, 2, "Pre-caching Image-to-Video pipeline weights...")
        LTXImageToVideoPipeline.from_pretrained(self.repo_id, dtype=torch.bfloat16)
        logger.model(self.id, f"Weights for '{self.repo_id}' cached locally.", level="success")

    def load_pipeline(self, device: str = "mps", is_image_to_video: bool = True) -> Any:
        dtype = torch.bfloat16
        mode = "Image-to-Video" if is_image_to_video else "Text-to-Video"
        logger.model(self.id, f"Loading {self.repo_id} ({mode})...")

        if is_image_to_video:
            pipe = LTXImageToVideoPipeline.from_pretrained(self.repo_id, dtype=dtype)
        else:
            pipe = LTXPipeline.from_pretrained(self.repo_id, dtype=dtype)

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
        num_frames: int = 81,
        fps: int = 25,
        steps: int = 30,
        generator: Optional[torch.Generator] = None,
    ) -> Any:
        # LTX requires frame count satisfying (num_frames - 1) % 8 == 0
        valid_frames = num_frames if (num_frames - 1) % 8 == 0 else 81

        # LTX requires height and width divisible by 32
        w = (width // 32) * 32
        h = (height // 32) * 32

        kwargs = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": w,
            "height": h,
            "num_frames": valid_frames,
            "frame_rate": fps,
            "num_inference_steps": steps,
            "guidance_scale": self.guidance_scale,
            "generator": generator,
        }
        if image is not None:
            kwargs["image"] = image

        return pipe(**kwargs).frames[0]

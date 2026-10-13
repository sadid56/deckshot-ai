from typing import Any
from src.models import ModelRegistry


def load_video_pipeline(
    model_name: str = "ltx",
    device: str = "mps",
    is_image_to_video: bool = True,
) -> Any:
    """
    Load diffusion pipeline for either Image-to-Video or Text-to-Video generation
    delegating directly to the registered ModelEngine.
    """
    engine = ModelRegistry.get(model_name)
    return engine.load_pipeline(device=device, is_image_to_video=is_image_to_video)

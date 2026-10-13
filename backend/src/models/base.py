import sys
import subprocess
import importlib
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import torch
from src.logger import logger


class BaseVideoModelEngine(ABC):
    """
    Abstract base engine for all video generation models.
    To add any new model to DeckShot AI, simply subclass this and register it!
    """

    id: str = ""
    name: str = ""
    description: str = ""
    recommended_hardware: str = "GPU with 12GB+ VRAM or Apple Silicon"
    default_fps: int = 25
    default_steps: int = 30
    default_frames: int = 81
    guidance_scale: float = 3.0
    dependencies: List[str] = []

    def check_dependencies(self) -> Dict[str, bool]:
        """Check if Python package dependencies for this model are installed."""
        status = {}
        for pkg in self.dependencies:
            mod_name = pkg.split(">=")[0].split("==")[0].split("<")[0].strip().replace("-", "_")
            try:
                importlib.import_module(mod_name)
                status[pkg] = True
            except ImportError:
                status[pkg] = False
        return status

    def is_installed(self) -> bool:
        """Return True if all package dependencies for this engine are met."""
        deps = self.check_dependencies()
        return all(deps.values()) if deps else True

    def install_dependencies(self) -> bool:
        """Install missing pip dependencies for this model engine."""
        missing = [pkg for pkg, installed in self.check_dependencies().items() if not installed]
        if not missing:
            logger.model(self.id, "All dependencies already satisfied.")
            return True

        logger.model(self.id, f"Installing required dependencies: {missing}")
        try:
            cmd = [sys.executable, "-m", "pip", "install"] + missing
            subprocess.check_call(cmd)
            logger.model(self.id, "Successfully installed dependencies.", level="success")
            return True
        except Exception as e:
            logger.model(self.id, f"Failed to install dependencies: {e}", level="error")
            return False

    @abstractmethod
    def download_weights(self, device: str = "cpu") -> None:
        """Pre-download model weights to local Hugging Face cache."""
        pass

    @abstractmethod
    def load_pipeline(self, device: str = "mps", is_image_to_video: bool = True) -> Any:
        """Load and return the diffusion pipeline ready for inference."""
        pass

    @abstractmethod
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
        """Generate and return video frames using model-specific kwargs."""
        pass

    def get_info(self) -> Dict[str, Any]:
        """Return metadata dictionary for frontend and CLI inspection."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "recommended_hardware": self.recommended_hardware,
            "default_fps": self.default_fps,
            "default_steps": self.default_steps,
            "default_frames": self.default_frames,
            "installed": self.is_installed(),
            "dependencies": self.dependencies,
        }

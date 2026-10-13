from typing import Dict, List, Optional
from src.models.base import BaseVideoModelEngine
from src.models.engines.ltx import LTXVideoEngine
from src.models.engines.cogvideox import CogVideoXEngine


class ModelRegistry:
    """
    Centralized Model Engine Registry.
    Adding a new video model requires only registering it here once!
    """

    _REGISTRY: Dict[str, BaseVideoModelEngine] = {}

    @classmethod
    def register(cls, engine: BaseVideoModelEngine) -> None:
        """Register a model engine."""
        cls._REGISTRY[engine.id.lower()] = engine

    @classmethod
    def get(cls, model_id: str) -> BaseVideoModelEngine:
        """Get model engine by ID."""
        key = model_id.lower().strip()
        if key not in cls._REGISTRY:
            available = list(cls._REGISTRY.keys())
            raise ValueError(
                f"Unknown model engine '{model_id}'. Available engines: {available}"
            )
        return cls._REGISTRY[key]

    @classmethod
    def list_models(cls) -> List[Dict]:
        """List all registered models and their capabilities/status."""
        return [engine.get_info() for engine in cls._REGISTRY.values()]

    @classmethod
    def install(cls, model_id: str) -> bool:
        """Install dependencies specific to the selected model."""
        engine = cls.get(model_id)
        return engine.install_dependencies()

    @classmethod
    def download(cls, model_id: str, device: str = "cpu") -> None:
        """Download and cache weights for the selected model."""
        engine = cls.get(model_id)
        engine.download_weights(device=device)


# Register default engines
ModelRegistry.register(LTXVideoEngine())
ModelRegistry.register(CogVideoXEngine())

import os
import warnings

# Suppress environment-specific warnings on macOS
warnings.filterwarnings("ignore", message=".*urllib3 v2 only supports OpenSSL.*")
warnings.filterwarnings(
    "ignore",
    message=".*User provided device_type of 'cuda'.*",
    category=UserWarning,
)

import torch

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
INPUTS_DIR = os.path.join(PROJECT_ROOT, "assets", "inputs")
OUTPUTS_DIR = os.path.join(PROJECT_ROOT, "assets", "outputs")

# Ensure required directories exist
os.makedirs(INPUTS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# Default Model Selection
# 'ltx': Lightricks/LTX-Video (~4.5 GB, 25 FPS, recommended for Apple Silicon and consumer GPUs)
# 'cogvideox': THUDM/CogVideoX-5b-I2V (~11 GB, 8 FPS, suitable for cloud GPU servers)
DEFAULT_MODEL = "ltx"

# Default Generation Parameters
DEFAULT_IMAGE = os.path.join(INPUTS_DIR, "input.jpg")
DEFAULT_PROMPT = (
    "Cinematic commercial product showcase. Smooth camera movement with elegant studio lighting, "
    "subtle light reflections across the surface, premium luxury presentation, high-definition details."
)
DEFAULT_NEGATIVE_PROMPT = "worst quality, blurry, distorted, glitch, sudden cuts, low resolution, artifacts"
DEFAULT_OUTPUT = os.path.join(OUTPUTS_DIR, "final_presentation.mp4")

DEFAULT_STEPS = 30
DEFAULT_FRAMES = 81  # ~3.2 seconds at 25 FPS. For LTX: must satisfy (frames - 1) % 8 == 0 (e.g., 49, 81, 121, 161)
DEFAULT_FPS = 25
DEFAULT_WIDTH = 704
DEFAULT_HEIGHT = 480

def get_device():
    """Detect available hardware accelerator: CUDA, Apple Silicon MPS, or CPU fallback."""
    if torch.cuda.is_available():
        return "cuda"
    elif torch.backends.mps.is_available():
        return "mps"
    return "cpu"

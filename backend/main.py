import os
import sys
import json
import argparse
import warnings

# Ensure backend directory is in sys.path when run from root
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load .env from project root
try:
    from dotenv import load_dotenv
    root_dir = os.path.dirname(backend_dir)
    load_dotenv(os.path.join(root_dir, ".env"))
except ImportError:
    pass

# Suppress environment-specific warnings on macOS
warnings.filterwarnings("ignore", message=".*urllib3 v2 only supports OpenSSL.*")
warnings.filterwarnings(
    "ignore",
    message=".*User provided device_type of 'cuda'.*",
    category=UserWarning,
)
from config import (
    DEFAULT_PROMPT,
    DEFAULT_NEGATIVE_PROMPT,
    DEFAULT_MODEL,
    DEFAULT_OUTPUT,
    DEFAULT_STEPS,
    DEFAULT_FRAMES,
    DEFAULT_FPS,
    get_device,
)
from src.models import ModelRegistry
from src.pipeline import load_video_pipeline
from src.generator import generate_single_video, generate_multi_scene_video
from src.logger import logger


def parse_arguments():
    registered_models = [m["id"] for m in ModelRegistry.list_models()]
    parser = argparse.ArgumentParser(
        description="DeckShot AI: Professional Presentation & Video Diffusion Studio"
    )
    parser.add_argument(
        "--image",
        type=str,
        default=None,
        help="Path to input reference image (optional, leave empty for Text-to-Video)",
    )
    parser.add_argument(
        "--prompt",
        type=str,
        default=DEFAULT_PROMPT,
        help="Motion prompt guiding the video animation",
    )
    parser.add_argument(
        "--negative_prompt",
        type=str,
        default=DEFAULT_NEGATIVE_PROMPT,
        help="Negative prompt to suppress visual artifacts",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"AI video model engine (Registered: {', '.join(registered_models)})",
    )
    parser.add_argument(
        "--list-models",
        action="store_true",
        help="Display all registered video model engines, specs, and dependency status",
    )
    parser.add_argument(
        "--install-deps",
        action="store_true",
        help="Automatically install model-specific Python dependencies for the selected --model",
    )
    parser.add_argument(
        "--download-only",
        action="store_true",
        help="Pre-download and cache model weights from Hugging Face without running video generation",
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=5,
        help="Target video duration in seconds (5, 10, 30, 60, 120)",
    )
    parser.add_argument(
        "--scenes",
        type=str,
        default=None,
        help="Path to a JSON file defining multiple scenes (e.g., scenes.json)",
    )
    parser.add_argument(
        "--images",
        nargs="+",
        default=None,
        help="List of multiple image paths to animate sequentially into a presentation",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=DEFAULT_OUTPUT,
        help="Destination path for the final MP4 video",
    )
    parser.add_argument(
        "--steps",
        type=int,
        default=DEFAULT_STEPS,
        help=f"Number of denoising steps (default: {DEFAULT_STEPS})",
    )
    parser.add_argument(
        "--frames",
        type=int,
        default=DEFAULT_FRAMES,
        help=f"Frames per clip (default: {DEFAULT_FRAMES})",
    )
    parser.add_argument(
        "--fps",
        type=int,
        default=DEFAULT_FPS,
        help=f"Video playback frame rate (default: {DEFAULT_FPS})",
    )
    return parser.parse_args()


def display_registered_models():
    models = ModelRegistry.list_models()
    logger.banner("DeckShot AI: Registered Model Engines")
    for m in models:
        logger.model_card(m)
    print("\n" + "=" * 64 + "\n")


def main():
    args = parse_arguments()

    if args.list_models:
        display_registered_models()
        return

    if args.install_deps:
        logger.info(f"Installing dependencies for engine '{args.model}'...")
        success = ModelRegistry.install(args.model)
        if success:
            logger.success(f"Engine '{args.model}' is ready to run!")
        else:
            logger.error(f"Failed to install dependencies for '{args.model}'.")
            sys.exit(1)
        return

    device = get_device()
    engine = ModelRegistry.get(args.model)

    logger.banner("DeckShot AI: Video Production Studio")
    logger.info(f"Compute Device: {device.upper()}")
    logger.info(f"Model Engine:   {engine.name}")
    logger.info(f"Target Duration: {args.duration}s")
    logger.info(f"Output Path:    {args.output}")

    # Check dependencies before loading
    if not engine.is_installed():
        logger.warn(f"Missing dependencies for '{engine.id}'. Auto-installing now...")
        engine.install_dependencies()

    if args.download_only:
        logger.info(f"Pre-downloading model weights for '{engine.id}' to local cache...")
        ModelRegistry.download(args.model, device=device)
        logger.success("Model weights successfully downloaded and cached locally!")
        return

    has_image = args.image is not None and os.path.exists(args.image)
    pipe = load_video_pipeline(model_name=args.model, device=device, is_image_to_video=has_image)

    # Case 1: Multi-scene via scenes.json
    if args.scenes:
        if not os.path.exists(args.scenes):
            print(f"Error: Scenes configuration file not found at '{args.scenes}'")
            sys.exit(1)
        with open(args.scenes, "r") as f:
            scenes = json.load(f)

        generate_multi_scene_video(
            pipe=pipe,
            scenes=scenes,
            output_path=args.output,
            fps=args.fps,
            steps=args.steps,
            frames=args.frames,
            device=device,
            model_name=args.model,
            duration=args.duration,
        )
        return

    # Case 2: Multi-scene via multiple images
    if args.images:
        scenes = [{"image": img_path, "prompt": args.prompt} for img_path in args.images]
        generate_multi_scene_video(
            pipe=pipe,
            scenes=scenes,
            output_path=args.output,
            fps=args.fps,
            steps=args.steps,
            frames=args.frames,
            device=device,
            model_name=args.model,
            duration=args.duration,
        )
        return

    # Case 3: Single Scene (Image-to-Video or Text-to-Video)
    generate_single_video(
        pipe=pipe,
        image_path=args.image,
        prompt=args.prompt,
        negative_prompt=args.negative_prompt,
        steps=args.steps,
        frames=args.frames,
        fps=args.fps,
        device=device,
        output_path=args.output,
        model_name=args.model,
        duration=args.duration,
    )


if __name__ == "__main__":
    main()
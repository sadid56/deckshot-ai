import os
import sys
import json
import argparse
from config import (
    DEFAULT_IMAGE,
    DEFAULT_PROMPT,
    DEFAULT_NEGATIVE_PROMPT,
    DEFAULT_MODEL,
    DEFAULT_OUTPUT,
    DEFAULT_STEPS,
    DEFAULT_FRAMES,
    DEFAULT_FPS,
    get_device,
)
from src.pipeline import load_video_pipeline
from src.generator import generate_single_video, generate_multi_scene_video

def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Video AI: Professional Image-to-Video and Multi-Scene Presentation Generator"
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
        "--download-only",
        action="store_true",
        help="Pre-download and cache model weights from Hugging Face without running video generation",
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
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        choices=["ltx", "cogvideox"],
        help="AI video model architecture: 'ltx' (recommended for Mac/consumer GPU) or 'cogvideox'",
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
        help=f"Frames per clip (default: {DEFAULT_FRAMES}; for LTX use 49, 81, 121, or 161)",
    )
    parser.add_argument(
        "--fps",
        type=int,
        default=DEFAULT_FPS,
        help=f"Video playback frame rate (default: {DEFAULT_FPS})",
    )
    return parser.parse_args()

def main():
    args = parse_arguments()
    device = get_device()

    print("==================================================")
    print("🎬 Video AI: Presentation & Ad Generator")
    print(f"🖥️  Compute Device: {device.upper()}")
    print(f"📦 Model Engine:    {args.model.upper()}")
    print(f"📁 Target Output:   {args.output}")
    print("==================================================")

    if args.download_only:
        print("\n📥 Pre-downloading model weights to Hugging Face cache (~/.cache/huggingface)...")
        print("➡️  [1/2] Fetching Text-to-Video pipeline...")
        load_video_pipeline(model_name=args.model, device=device, is_image_to_video=False)
        print("➡️  [2/2] Fetching Image-to-Video pipeline...")
        load_video_pipeline(model_name=args.model, device=device, is_image_to_video=True)
        print("\n==================================================")
        print("✅ All model weights successfully downloaded and cached locally!")
        print("You can now run DeckShot AI completely offline without waiting.")
        print("==================================================")
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
        )

    # Case 2: Multi-scene via list of images from CLI
    elif args.images and len(args.images) > 1:
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
        )

    # Case 3: Single-video generation (Text-to-Video or Image-to-Video)
    else:
        active_image = args.image if (args.image and os.path.exists(args.image)) else None
        generate_single_video(
            pipe=pipe,
            image_path=active_image,
            prompt=args.prompt,
            negative_prompt=args.negative_prompt,
            steps=args.steps,
            frames=args.frames,
            fps=args.fps,
            device=device,
            output_path=args.output,
            model_name=args.model,
        )

    print("\n🎉 Process completed successfully!")
    print(f"Generated video available at: {os.path.abspath(args.output)}")


if __name__ == "__main__":
    main()
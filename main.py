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
        default=DEFAULT_IMAGE,
        help="Path to single input reference image (e.g., assets/inputs/input.jpg)",
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

    # Load the selected diffusion pipeline
    pipe = load_video_pipeline(model_name=args.model, device=device)

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

    # Case 3: Single-image video generation
    else:
        if not os.path.exists(args.image):
            print(f"\n[Warning] Input image '{args.image}' not found.")
            # Check fallback in assets/inputs/
            fallback = os.path.join("assets", "inputs", os.path.basename(args.image))
            if os.path.exists(fallback):
                args.image = fallback
                print(f"[Info] Found image at fallback location: '{args.image}'")
            elif os.path.exists("input.jpg"):
                args.image = "input.jpg"
                print(f"[Info] Found 'input.jpg' in root directory.")
            else:
                print("Please provide a valid image using --image or place 'input.jpg' in assets/inputs/")
                sys.exit(1)

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
        )

    print("\n🎉 Process completed successfully!")
    print(f"Generated video available at: {os.path.abspath(args.output)}")

if __name__ == "__main__":
    main()
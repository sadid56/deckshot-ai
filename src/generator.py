import os
from typing import Optional
import torch
from .utils import load_image_safely, save_frames_to_video, concatenate_video_clips

def generate_single_video(
    pipe,
    image_path: Optional[str] = None,
    prompt: str = "",
    negative_prompt: str = "worst quality, blurry, distorted, low resolution",
    steps: int = 30,
    frames: int = 81,
    fps: int = 25,
    device: str = "mps",
    output_path: str = "output.mp4",
    model_name: str = "ltx",
    width: int = 704,
    height: int = 480,
    seed: int = 42,
) -> str:
    """
    Generate a video clip.
    If image_path is provided, uses Image-to-Video.
    If image_path is None, generates purely from prompt (Text-to-Video).
    """
    generator = torch.Generator(device=device).manual_seed(seed)
    has_image = image_path is not None and os.path.exists(image_path)
    image = load_image_safely(image_path) if has_image else None

    mode_label = "Image-to-Video" if has_image else "Text-to-Video"
    print(f"\n[Generator] Mode: {mode_label} | {frames} frames @ {fps} FPS, {steps} steps")
    print(f"[Generator] Prompt: \"{prompt}\"")

    if model_name.lower() == "ltx":
        valid_frames = frames if (frames - 1) % 8 == 0 else 81
        kwargs = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "num_frames": valid_frames,
            "frame_rate": fps,
            "num_inference_steps": steps,
            "guidance_scale": 3.0,
            "generator": generator,
        }
        if has_image:
            kwargs["image"] = image

        video_frames = pipe(**kwargs).frames[0]
    else:
        # CogVideoX
        kwargs = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "num_frames": 49,
            "num_inference_steps": steps,
            "guidance_scale": 6.0,
            "generator": generator,
        }
        if has_image:
            kwargs["image"] = image

        video_frames = pipe(**kwargs).frames[0]
        fps = 8

    save_frames_to_video(video_frames, output_path, fps=fps)
    print(f"[Generator] Clip saved successfully: {output_path}")
    return output_path

def generate_multi_scene_video(
    pipe,
    scenes: list,
    output_path: str,
    fps: int = 25,
    steps: int = 30,
    frames: int = 81,
    device: str = "mps",
    model_name: str = "ltx",
    temp_dir: str = "assets/outputs/temp_clips",
) -> str:
    """Generate multiple sequential scenes and stitch them into a master presentation."""
    os.makedirs(temp_dir, exist_ok=True)
    clip_paths = []

    print(f"\n==========================================")
    print(f"🎬 Starting Multi-Scene Presentation Generation ({len(scenes)} scenes)")
    print(f"==========================================")

    for idx, scene in enumerate(scenes, start=1):
        image_path = scene.get("image")
        prompt = scene.get("prompt", "")
        negative_prompt = scene.get("negative_prompt", "worst quality, blurry, distorted")
        scene_clip_path = os.path.join(temp_dir, f"scene_{idx:02d}.mp4")

        print(f"\n--- Processing Scene {idx}/{len(scenes)} ---")
        if image_path and os.path.exists(image_path):
            print(f"Image Reference: {image_path}")
        else:
            print("Mode: Text-to-Video (No reference image)")
        print(f"Prompt: {prompt}")

        generate_single_video(
            pipe=pipe,
            image_path=image_path,
            prompt=prompt,
            negative_prompt=negative_prompt,
            steps=steps,
            frames=frames,
            fps=fps,
            device=device,
            output_path=scene_clip_path,
            model_name=model_name,
            seed=42 + idx,
        )
        clip_paths.append(scene_clip_path)

    print(f"\n[Stitching] Concatenating {len(clip_paths)} scenes into master presentation...")
    concatenate_video_clips(clip_paths, output_path, fps=fps)
    print(f"✅ Master presentation video created: {output_path}")
    return output_path

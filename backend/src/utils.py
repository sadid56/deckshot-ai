import os
import imageio
from PIL import Image
from diffusers.utils import load_image, export_to_video

def load_image_safely(image_path: str) -> Image.Image:
    """Load and validate an image from a local path or URL."""
    if not os.path.exists(image_path) and not image_path.startswith(("http://", "https://")):
        raise FileNotFoundError(f"Image not found at path: '{image_path}'")
    return load_image(image_path)

def concatenate_video_clips(clip_paths: list, output_path: str, fps: int = 25) -> str:
    """Concatenate multiple video clip files into a single video."""
    if not clip_paths:
        raise ValueError("No video clips provided for concatenation.")

    if len(clip_paths) == 1:
        # If only one clip, rename/copy or return it
        return clip_paths[0]

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    writer = imageio.get_writer(output_path, fps=fps, quality=8)

    for clip in clip_paths:
        reader = imageio.get_reader(clip)
        for frame in reader:
            writer.append_data(frame)
        reader.close()

    writer.close()
    return output_path

def save_frames_to_video(frames, output_path: str, fps: int = 25) -> str:
    """Export a sequence of generated frames to an MP4 video file."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    export_to_video(frames, output_path, fps=fps)
    return output_path

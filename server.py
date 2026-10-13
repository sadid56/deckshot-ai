import os
import sys
import uuid
import json
import time
import shutil
import threading
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

import config
from src.pipeline import load_video_pipeline
from src.generator import generate_single_video, generate_multi_scene_video

app = FastAPI(title="DeckShot AI", description="Local Text-to-Video and Image-to-Video Studio")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS = {}
CURRENT_PIPELINE = None
CURRENT_CONFIG = None  # (model_name, is_image_to_video)
PIPELINE_LOCK = threading.Lock()

def get_cached_pipeline(model_name: str, device: str, is_image_to_video: bool):
    """Reuse cached pipeline in memory if matching configuration is already loaded."""
    global CURRENT_PIPELINE, CURRENT_CONFIG
    config_key = (model_name, is_image_to_video)
    with PIPELINE_LOCK:
        if CURRENT_PIPELINE is not None and CURRENT_CONFIG == config_key:
            return CURRENT_PIPELINE
        CURRENT_PIPELINE = load_video_pipeline(
            model_name=model_name,
            device=device,
            is_image_to_video=is_image_to_video
        )
        CURRENT_CONFIG = config_key
        return CURRENT_PIPELINE

def run_single_job(
    job_id: str,
    image_path: Optional[str],
    prompt: str,
    negative_prompt: str,
    model_name: str,
    steps: int,
    frames: int,
    fps: int,
    duration: int = 5,
):
    try:
        is_i2v = image_path is not None and os.path.exists(image_path)
        mode_name = "Image-to-Video" if is_i2v else "Text-to-Video"

        JOBS[job_id]["status"] = "running"
        JOBS[job_id]["progress"] = 15
        JOBS[job_id]["logs"].append(f"Initializing {model_name.upper()} ({mode_name}) for {duration}s video...")

        device = config.get_device()
        pipe = get_cached_pipeline(model_name, device, is_image_to_video=is_i2v)

        JOBS[job_id]["progress"] = 35
        JOBS[job_id]["logs"].append(f"Model ready. Commencing {mode_name} latent synthesis ({duration}s target)...")

        output_filename = f"gen_{uuid.uuid4().hex[:8]}.mp4"
        output_filepath = os.path.join(config.OUTPUTS_DIR, output_filename)

        generate_single_video(
            pipe=pipe,
            image_path=image_path,
            prompt=prompt,
            negative_prompt=negative_prompt,
            steps=steps,
            frames=frames,
            fps=fps,
            device=device,
            output_path=output_filepath,
            model_name=model_name,
            duration=duration,
        )

        JOBS[job_id]["progress"] = 100
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["video_url"] = f"/api/videos/{output_filename}"
        JOBS[job_id]["logs"].append(f"Video rendering finished: {output_filename}")

    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        JOBS[job_id]["logs"].append(f"Generation failed: {str(e)}")

def run_multi_job(job_id: str, scenes: list, model_name: str, steps: int, frames: int, fps: int, duration: int = 60):
    try:
        # Check if any scene uses an image
        has_any_image = any(sc.get("image") and os.path.exists(sc.get("image")) for sc in scenes)

        JOBS[job_id]["status"] = "running"
        JOBS[job_id]["progress"] = 15
        JOBS[job_id]["logs"].append(f"Preparing multi-scene pipeline ({len(scenes)} scenes, {duration}s target)...")

        device = config.get_device()
        pipe = get_cached_pipeline(model_name, device, is_image_to_video=has_any_image)

        output_filename = f"presentation_{uuid.uuid4().hex[:8]}.mp4"
        output_filepath = os.path.join(config.OUTPUTS_DIR, output_filename)

        JOBS[job_id]["progress"] = 35
        JOBS[job_id]["logs"].append("Synthesizing scene sequences...")

        generate_multi_scene_video(
            pipe=pipe,
            scenes=scenes,
            output_path=output_filepath,
            fps=fps,
            steps=steps,
            frames=frames,
            device=device,
            model_name=model_name,
            duration=duration,
        )

        JOBS[job_id]["progress"] = 100
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["video_url"] = f"/api/videos/{output_filename}"
        JOBS[job_id]["logs"].append(f"Master presentation assembled: {output_filename}")

    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        JOBS[job_id]["logs"].append(f"Multi-scene rendering failed: {str(e)}")

@app.get("/api/system")
def get_system_info():
    device = config.get_device()
    return {
        "device": device.upper(),
        "is_accelerated": device in ["cuda", "mps"],
        "default_model": config.DEFAULT_MODEL,
    }

@app.post("/api/generate")
async def api_generate_single(
    background_tasks: BackgroundTasks,
    image: Optional[UploadFile] = File(None),
    prompt: str = Form(...),
    negative_prompt: str = Form(config.DEFAULT_NEGATIVE_PROMPT),
    model: str = Form("ltx"),
    duration: int = Form(5),
    steps: int = Form(30),
    frames: int = Form(81),
    fps: int = Form(25),
    aspect_ratio: str = Form("16:9"),
):
    if not prompt or not prompt.trim() if hasattr(prompt, "trim") else not prompt.strip():
        raise HTTPException(status_code=400, detail="Please provide a prompt.")

    job_id = str(uuid.uuid4())
    image_dest = None

    # Reference image is OPTIONAL
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        image_dest = os.path.join(config.INPUTS_DIR, f"upload_{job_id[:8]}{ext}")
        with open(image_dest, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    JOBS[job_id] = {
        "id": job_id,
        "status": "queued",
        "progress": 5,
        "logs": ["Job submitted and queued for rendering."],
        "video_url": None,
        "error": None,
    }

    background_tasks.add_task(
        run_single_job,
        job_id=job_id,
        image_path=image_dest,
        prompt=prompt,
        negative_prompt=negative_prompt,
        model_name=model,
        steps=steps,
        frames=frames,
        fps=fps,
        duration=duration,
    )

    return {"job_id": job_id, "status": "queued"}

@app.post("/api/generate-scenes")
async def api_generate_scenes(
    background_tasks: BackgroundTasks,
    scenes_json: str = Form(...),
    images: List[UploadFile] = File([]),
    model: str = Form("ltx"),
    duration: int = Form(60),
    steps: int = Form(30),
    frames: int = Form(81),
    fps: int = Form(25),
    aspect_ratio: str = Form("16:9"),
):
    job_id = str(uuid.uuid4())
    try:
        scenes_data = json.loads(scenes_json)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid scenes JSON format.")

    # Save any user uploaded files (if provided)
    saved_images = {}
    for upload in images:
        if upload.filename:
            ext = os.path.splitext(upload.filename)[1] or ".jpg"
            path = os.path.join(config.INPUTS_DIR, f"scene_{uuid.uuid4().hex[:6]}{ext}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(upload.file, buffer)
            saved_images[upload.filename] = path

    prepared_scenes = []
    for sc in scenes_data:
        img_name = sc.get("image")
        img_path = saved_images.get(img_name) if img_name else None

        prepared_scenes.append({
            "image": img_path,
            "prompt": sc.get("prompt", config.DEFAULT_PROMPT),
            "negative_prompt": sc.get("negative_prompt", config.DEFAULT_NEGATIVE_PROMPT),
        })

    JOBS[job_id] = {
        "id": job_id,
        "status": "queued",
        "progress": 5,
        "logs": [f"Multi-scene job queued ({len(prepared_scenes)} scenes, {duration}s target)."],
        "video_url": None,
        "error": None,
    }

    background_tasks.add_task(
        run_multi_job,
        job_id=job_id,
        scenes=prepared_scenes,
        model_name=model,
        steps=steps,
        frames=frames,
        fps=fps,
        duration=duration,
    )

    return {"job_id": job_id, "status": "queued"}

@app.get("/api/status/{job_id}")
def get_job_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job

@app.get("/api/videos/{filename}")
def stream_video(filename: str):
    file_path = os.path.join(config.OUTPUTS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file not found.")
    return FileResponse(file_path, media_type="video/mp4")

@app.get("/api/recent-videos")
def get_recent_videos():
    if not os.path.exists(config.OUTPUTS_DIR):
        return []
    files = [
        f for f in os.listdir(config.OUTPUTS_DIR)
        if f.endswith(".mp4")
    ]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(config.OUTPUTS_DIR, x)), reverse=True)
    return [
        {
            "filename": f,
            "url": f"/api/videos/{f}",
            "created_at": time.strftime('%Y-%m-%d %H:%M', time.localtime(os.path.getmtime(os.path.join(config.OUTPUTS_DIR, f))))
        }
        for f in files[:8]
    ]

# Mount compiled React frontend
frontend_dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    print("\n=======================================================")
    print("🚀 Video AI Web Studio running at: http://localhost:8000")
    print("=======================================================\n")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)

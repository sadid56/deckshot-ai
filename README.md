# 🎬 DeckShot AI

> **Professional Presentation & AI Video Diffusion Studio**  
> Turn static presentation decks, product slides, and text prompts into fluid, cinematic video presentations using state-of-the-art open-source diffusion models.

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?logo=pytorch)](https://pytorch.org/)
[![Diffusers](https://img.shields.io/badge/🤗_Diffusers-0.36-yellow.svg)](https://github.com/huggingface/diffusers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 What is DeckShot AI?

**DeckShot AI** is an end-to-end studio designed to bring static slide decks and creative visual concepts to life. Whether you are building an AI video pitch for a startup, animating educational presentations, or generating commercial product motion shots, DeckShot AI provides:

- **Image-to-Video (I2V)**: Bring any slide, infographic, or product photo to life with natural motion and cinematic lighting.
- **Text-to-Video (T2V)**: Generate brand-new video footage directly from descriptive motion prompts.
- **Multi-Scene Storyboards**: Sequence multiple images and prompts into continuous presentations using `scenes.json`.
- **Hybrid Cloud & Local Engine**:
  - ☁️ **Cloud Mode (100% Free Zero-Load)**: Offload heavy AI video synthesis to a free **Google Colab Tesla T4 GPU** via Cloudflare Tunnel. Keeps your local Mac/PC cool and responsive with 0% hardware freeze!
  - 💻 **Local Mode**: Run directly on your machine with native hardware acceleration (**Apple Silicon MPS** or **NVIDIA CUDA**).
- **Interactive Web Studio**: Built with React 19, TypeScript, and Vite featuring real-time job monitoring, motion prompt tuning, parameter controls, and video playback.

---

## 🖥️ System Requirements & Supported OS

DeckShot AI is cross-platform and runs on:

| Operating System | Local Acceleration | Cloud Mode (Google Colab) |
| :--- | :--- | :--- |
| **macOS** (Apple Silicon M1/M2/M3/M4) | MPS (Metal Performance Shaders) | ✅ Recommended (Zero fan/memory load) |
| **Linux** (Ubuntu, Debian, Fedora, Arch) | NVIDIA CUDA (`torch.cuda`) | ✅ Fully Supported |
| **Windows 10/11** (PowerShell / WSL2) | NVIDIA CUDA (`torch.cuda`) | ✅ Fully Supported |

### Prerequisites
- **Git**
- **Node.js** (v18.0.0 or higher) & **pnpm** (or `npm`)
- **Python** (v3.9 to v3.12) & **pip**

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/sadid56/deckshot-ai.git
cd deckshot-ai
```

---

### 2. Frontend Setup (Web Studio)
Install client-side dependencies:

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

---

### 3. Backend Setup (Python)

Create and activate an isolated Python virtual environment:

#### 🍏 On macOS / 🐧 On Linux:
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 🪟 On Windows (PowerShell):
```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

#### 🪟 On Windows (Command Prompt - CMD):
```cmd
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

---

### 4. Configure Environment Variables

Copy the example environment file:

#### macOS / Linux:
```bash
cp .env.example .env
```

#### Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

---

## 🏃 Running the Application

### Option A: Interactive Web Studio (Frontend + Backend)

Start both services in separate terminal windows (or tabs):

1. **Start the Backend API Server:**
   ```bash
   pnpm server
   # or: python backend/server.py
   ```
   *The server starts at `http://127.0.0.1:8000` (Swagger docs available at `http://127.0.0.1:8000/docs`).*

2. **Start the Frontend Studio:**
   ```bash
   pnpm dev
   ```
   *Open your browser and visit **`http://localhost:5173`** to access the DeckShot AI Studio.*

---

### Option B: CLI Automation (Command Line)

You can also generate videos directly via terminal without launching the web interface:

```bash
# Text-to-Video generation
python backend/main.py \
  --prompt "Cinematic drone view of a modern skyscraper at sunset" \
  --steps 30 \
  --frames 81

# Image-to-Video generation
python backend/main.py \
  --image assets/inputs/input.jpg \
  --prompt "Smooth camera pan showcasing the product details with elegant studio lighting" \
  --output assets/outputs/my_video.mp4
```

To see all CLI options:
```bash
python backend/main.py --help
```

---

## ⚡ 100% Free Cloud GPU Mode (Google Colab)

If you are running on a machine without a dedicated high-end GPU or want **zero system lag**, you can offload all video rendering to a **Free Google Colab Tesla T4 GPU (16GB VRAM)**:

### Step 1: Open Google Colab
1. Go to [Google Colab](https://colab.research.google.com).
2. Create a **New Notebook**.
3. In the menu, go to **Runtime** ➔ **Change runtime type**, select **T4 GPU**, and click **Save**.

### Step 2: Run the 1-Click Worker Script
Paste and run the following code in the notebook cell:

```python
# 1. প্রয়োজনীয় লাইব্রেরি ইনস্টল
!pip install -q -U diffusers transformers accelerate bitsandbytes sentencepiece fastapi uvicorn
!wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
!dpkg -i cloudflared-linux-amd64.deb

# 2. 4-Bit আল্ট্রা-লাইটওয়েট LTX-Video সার্ভার (Never Crash)
import threading, time, torch
from fastapi import FastAPI, Form
from fastapi.responses import FileResponse
from diffusers import LTXPipeline
from diffusers.quantizers import PipelineQuantizationConfig
from diffusers.utils import export_to_video
import uvicorn

app = FastAPI()
print("⚡ Loading Ultra-Stable LTX-Video on Google Colab T4 GPU...")

# 4-Bit কম্প্রেশন
quant_config = PipelineQuantizationConfig(
    quant_backend="bitsandbytes_4bit",
    quant_kwargs={
        "load_in_4bit": True,
        "bnb_4bit_quant_type": "nf4",
        "bnb_4bit_compute_dtype": torch.float16
    },
    components_to_quantize=["transformer", "text_encoder"]
)

pipe = LTXPipeline.from_pretrained(
    "Lightricks/LTX-Video",
    quantization_config=quant_config,
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True
)

# 🛑 মেমোরি ক্র্যাশ ঠেকানোর মূল সমাধান:
pipe.enable_model_cpu_offload()
pipe.vae.enable_tiling()   # মেমোরি স্পাইক রোধ করে ২.৫ জিবিতে সীমাবদ্ধ রাখবে

@app.post("/generate")
def generate_video(prompt: str = Form(...), steps: int = Form(20), frames: int = Form(25)):
    # T4 GPU-র জন্য সেফ ফ্রেম (25 ফ্রেম = ক্র্যাশ ছাড়া ১০০% সফল রেন্ডার)
    num_frames = 25
    output = pipe(
        prompt=prompt,
        num_inference_steps=20,
        num_frames=num_frames,
        width=512,
        height=320
    ).frames[0]
    export_to_video(output, "output.mp4", fps=16)
    return FileResponse("output.mp4", media_type="video/mp4")

# ব্যাকগ্রাউন্ডে সার্ভার চালানো
def run_app():
    uvicorn.run(app, host="127.0.0.1", port=8000)

threading.Thread(target=run_app, daemon=True).start()
time.sleep(3)

# 3. ক্লাউড টানেল লিঙ্ক তৈরি
print("\n🔗 আপনার ক্লাউড টানেল লিঙ্ক তৈরি হচ্ছে...\n")
!cloudflared tunnel --url http://127.0.0.1:8000
```

### Step 3: Connect to your Local Studio
Colab will output a public URL like:
```text
https://random-assigned-name.trycloudflare.com
```

Copy that URL and paste it into your local `.env` file:
```env
COLAB_URL="https://random-assigned-name.trycloudflare.com"
```

Restart your backend (`pnpm server`). Now, every video generation request submitted from your local Web Studio is instantly rendered on Google's cloud GPU and returned directly to your screen with **0% local CPU/GPU consumption!**

---

## 🛠️ Supported Models

| Engine Key | Model Name | Parameters | Best Suited For |
| :--- | :--- | :--- | :--- |
| `ltx` (Default) | `Lightricks/LTX-Video` | ~4.5B | High-fidelity 25 FPS commercial animations, fast sampling, slide transitions |
| `cogvideox` | `THUDM/CogVideoX-5b-I2V` | ~5B | Stylized cinematic rendering & motion coherence |

---

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome!
Feel free to open an issue or submit a pull request on GitHub: [https://github.com/sadid56/deckshot-ai](https://github.com/sadid56/deckshot-ai).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

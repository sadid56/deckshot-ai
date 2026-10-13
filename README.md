# DeckShot AI

A local, private AI video creation studio powered by cutting-edge diffusion models (**Lightricks/LTX-Video** and **THUDM/CogVideoX**). Generate high-definition commercial videos, product ads, and multi-scene presentations directly on your local hardware using either **Text-to-Video** or **Image-to-Video** workflows.

---

## 📌 Features

- **Text-to-Video (T2V):** Describe the motion and visual scene to generate realistic 25 FPS video directly from text.
- **Image-to-Video (I2V):** Upload any product, slide, or character image to animate it into cinematic footage. Image upload is optional.
- **Multi-Scene Storyboards:** Chain multiple scenes and slides sequentially; the engine automatically renders each clip and stitches them into a master presentation.
- **Modern Studio Interface:** Built with React 19, TypeScript, and Material UI (MUI) on top of an asynchronous FastAPI backend.
- **Hardware Acceleration:** Native support for Apple Silicon (Metal / MPS), NVIDIA GPUs (CUDA), and CPU fallback with automated model memory offloading.

---

## 💻 System Requirements

| Component            | Minimum                                                    | Recommended                             |
| :------------------- | :--------------------------------------------------------- | :-------------------------------------- |
| **Operating System** | macOS (Apple Silicon), Ubuntu 20.04+, Windows 10/11        | macOS (M3/M4) or Ubuntu with NVIDIA GPU |
| **Python**           | 3.9 - 3.12                                                 | 3.10 or 3.11                            |
| **Node.js & pnpm**   | Node.js 18+ and pnpm 8+                                    | Node.js 20+ and pnpm 10+                |
| **Memory / VRAM**    | 16 GB Unified Memory (Mac) or 12 GB VRAM (NVIDIA)          | 16 GB+ Unified Memory or 16 GB+ VRAM    |
| **Disk Space**       | ~30 GB free space (for caching Hugging Face model & T5-XXL text encoder weights) | Fast NVMe SSD                           |


---

## 🚀 Setup & Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/sadid56/deckshot-ai.git
cd deckshot-ai
```

---

### 2. Python Environment Setup

#### 🍏 macOS & 🐧 Linux

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

> **Note for macOS:** PyTorch with Apple Silicon MPS acceleration is included in the requirements.

#### 🪟 Windows

Open PowerShell or Command Prompt in the project folder:

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

> **Note for Windows CUDA:** If you have an NVIDIA GPU, make sure you have the NVIDIA CUDA Toolkit (11.8 or 12.x) installed. PyTorch will automatically utilize your GPU.

---

### 3. Frontend Setup (pnpm)

Open a terminal and install the frontend dependencies:

```bash
cd frontend
pnpm install
pnpm build
cd ..
```

---

### 4. AI Model Download (~28–30 GB)

Because DeckShot AI runs open-source diffusion models **100% locally and privately on your machine**, the model weights must be downloaded from Hugging Face before generating video.

> **📦 Total Download Size:** Approximately **~28–30 GB**
> - **Google T5-XXL Text Encoder:** ~19 GB (divided into 4 shards for high-fidelity prompt comprehension)
> - **Lightricks LTX-Video DiT Transformer:** ~7.7 GB (core video generation engine)
> - **Video Autoencoder (VAE) & Tokenizers:** ~1.7 GB

You have two options to download the models:

#### Option 1: Automatic Download on First Generation
You don't need to do anything manually! When you trigger your first video generation (either through the Web Studio UI or CLI), DeckShot AI will automatically fetch and cache all model files.

#### Option 2: Pre-download via CLI (Recommended)
If you want to download all weights ahead of time so the Web Studio is ready to generate immediately without delay:

```bash
python main.py --download-only
```

> 💡 **Good to Know:**
> - **One-time Download:** This download happens **ONLY ONCE**.
> - **Local Cache:** All weights are permanently stored in your user cache directory (`~/.cache/huggingface/hub/`).
> - **100% Offline:** Once downloaded, DeckShot AI operates entirely offline with zero external network calls or cloud dependencies.

---

## 🎬 Running the Studio


### Option A: Web Studio (Recommended)

Start the studio server with a single command:

```bash
python server.py
```

Open your browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

---

### Option B: Live Development Mode (Hot-Reload)

If you want to edit the React frontend with live hot-reloading:

1. **Terminal 1 (Backend):**

   ```bash
   python server.py
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   pnpm dev
   ```

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)** _(API requests are automatically proxied to port 8000)_

---

### Option C: Command-Line Interface (CLI)

You can also run video generation directly from the command line without launching the web browser:

#### Text-to-Video:

```bash
python main.py --prompt "A sleek sports car accelerating along a coastal highway at sunset, cinematic lighting" --output assets/outputs/car.mp4
```

#### Image-to-Video:

```bash
python main.py --image assets/inputs/my_product.jpg --prompt "Slow 360-degree camera orbit around the product with studio lighting" --output assets/outputs/product.mp4
```

#### Multi-Scene Presentation:

```bash
python main.py --scenes scenes.json --output assets/outputs/presentation.mp4
```

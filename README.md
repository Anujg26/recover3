# Recover3

Recover3 is a next-generation mobility and recovery tracking platform. It leverages a React Native mobile application for patients and practitioners, a Python backend with computer vision (MediaPipe) for automated Range of Motion (ROM) tracking, and local AI (Ollama + Llama 3) for autonomous clinical summaries.

## Project Structure
- `mobile/` - React Native (Expo) app for the user & clinician interfaces.
- `rom_server/` - Python FastAPI backend handling camera streams and AI insights.
- `supabase/` - Database schema migrations and RLS policies.

---

## 🛠 Tech Stack
- **Frontend**: React Native (Expo), TypeScript, Lucide Icons
- **Backend Engine**: Python, FastAPI, WebSockets
- **Computer Vision**: OpenCV, Google MediaPipe (3D Pose Tracking)
- **Clinical Intelligence**: Ollama (Local Llama 3 LLM)
- **Database**: Supabase (PostgreSQL)

---

## 🚀 Quick Start Guide

You need two terminal windows to run the full platform.

### 1. Launch the Backend Server (ROM Tracking & AI)
This server processes the webcam feed for ROM check-ins and automatically updates AI clinical summaries using local LLMs.
*(Ensure the **Ollama** app is open and running on your Mac before starting).*

Open **Terminal 1**:
```bash
# First, activate your virtual environment
source ./rom_server/venv/bin/activate

# Start the server
python ./rom_server/server.py
```

### 2. Launch the Mobile App
This is the patient and practitioner dashboard.

Open **Terminal 2**:
```bash
cd mobile

# Start the Expo development server (clearing cache)
npx expo start -c
```
*Press `i` in the terminal to quickly launch the iOS Simulator.*

---

## 🧠 Core Features
- **Practitioner Dashboard**: High-fidelity, real-time views of patient recovery trajectories.
- **Smart ROM Tracking**: WebSockets and MediaPipe process live camera feeds to measure patient joint mobility.
- **Autonomous Insights**: Every time a patient logs a recovery session, Llama 3 instantly generates and saves a clinical impression for their practitioner.

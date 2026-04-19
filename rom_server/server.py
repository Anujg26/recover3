import sys
import os
import asyncio
import json
import cv2
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from rom_processor import ROMProcessor

# Add root to path so we can import the AI generator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai_summary_generator import generate_summary

app = FastAPI(title="Shoulder ROM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Video Capture shared across sessions
vcap = cv2.VideoCapture(0)

class VideoStreamer:
    def __init__(self):
        self.active_sessions: dict[str, WebSocket] = {}
        self.running = False

    async def start(self):
        if self.running: return
        self.running = True
        print("🚀 Camera streaming task initiated.")
        
        while self.running:
            if not self.active_sessions:
                await asyncio.sleep(0.5)
                continue
            
            # Read frame from Mac camera
            ret, frame = vcap.read()
            if not ret:
                print("❌ Failed to read from camera.")
                await asyncio.sleep(0.1)
                continue

            # Process and Broadcast
            for session_id, ws in list(self.active_sessions.items()):
                try:
                    proc = processors.get(session_id)
                    if not proc: continue

                    # Process in a thread to keep the loop fast
                    result = await asyncio.to_thread(proc.process_image, frame.copy())
                    
                    # Fire-and-forget send so network lag doesn't block the camera loop
                    asyncio.create_task(self.safe_send(ws, result, session_id))
                except Exception as e:
                    print(f"⚠️ Stream error for {session_id}: {e}")

            # Target ~12 FPS
            await asyncio.sleep(0.06)

    async def safe_send(self, ws: WebSocket, data: dict, session_id: str):
        try:
            await ws.send_text(json.dumps(data))
            # print(f"📡 Frame sent to {session_id}")
        except Exception:
            self.active_sessions.pop(session_id, None)

streamer = VideoStreamer()
processors: dict[str, ROMProcessor] = {}

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(streamer.start())

@app.on_event("shutdown")
async def shutdown_event():
    streamer.running = False
    vcap.release()

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(ws: WebSocket, session_id: str):
    await ws.accept()
    print(f"✅ Client {session_id} connected.")
    
    proc = ROMProcessor()
    processors[session_id] = proc
    streamer.active_sessions[session_id] = ws

    try:
        while True:
            # Keep connection alive & listen for resets
            message = await ws.receive_text()
            if message.strip().lower() == "reset":
                proc.reset()
                print(f"🔄 Reset received for {session_id}")

    except WebSocketDisconnect:
        print(f"🛑 Client {session_id} disconnected.")
    finally:
        streamer.active_sessions.pop(session_id, None)
        processors.pop(session_id, None)

@app.post("/api/ai/refresh/{patient_id}")
async def refresh_ai_summary(patient_id: str):
    print(f"🤖 Triggering AI Summary refresh for: {patient_id}")
    # Run AI generation in a separate thread so it doesn't block the camera stream
    success = await asyncio.to_thread(generate_summary, patient_id)
    return {"success": success}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, workers=1)

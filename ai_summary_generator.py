import requests
import json
from datetime import datetime, timedelta

# --- CONFIGURATION ---
SUPABASE_URL = "https://qbtvgjykvpgiomjjjenj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidHZnanlrdnBnaW9tampqZW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDAyMzIsImV4cCI6MjA5MjExNjIzMn0.pOp6Lo5JWF3AxS4ibyRGuqO_KWpKb_b3RPAsf_oDp2g"

# Ollama API Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
API_KEY = "LOCAL" 

def get_supabase_headers(upsert=False):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    if upsert:
        headers["Prefer"] = "resolution=merge-duplicates"
    return headers

def fetch_recovery_data(patient_id):
    print(f"Fetching data for patient: {patient_id}...")
    
    # 1. Query for Latest ROM
    rom_url = f"{SUPABASE_URL}/rest/v1/rom_measurements?patient_id=eq.{patient_id}&select=joint,side,range_of_motion_degrees&order=measured_at.desc&limit=1"
    rom_res = requests.get(rom_url, headers=get_supabase_headers())
    rom_data = rom_res.json() if rom_res.status_code == 200 else []
    
    # 2. Query for Logs from last 24 hours
    since = (datetime.utcnow() - timedelta(hours=24)).isoformat()
    logs_url = f"{SUPABASE_URL}/rest/v1/recovery_logs?patient_id=eq.{patient_id}&logged_at=gt.{since}&select=activity_type,duration_minutes,notes"
    logs_res = requests.get(logs_url, headers=get_supabase_headers())
    logs_data = logs_res.json() if logs_res.status_code == 200 else []
    
    return rom_data + logs_data

def get_ai_summary(data):
    print("Generating AI Summary via Ollama (Llama 3)...")
    
    prompt = f"""
Given these data points, give a detailed but concise summary of this patient’s recovery progress. Just give the summary, don't have any headers or titles at the top of your response:
{json.dumps(data, indent=2)}

Format your response as a professional clinical summary that a practitioner would review.
"""

    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=90)
        if response.status_code == 200:
            return response.json().get("response")
        else:
            return f"Error from Ollama: {response.text}"
    except Exception as e:
        return f"Could not connect to Ollama. Error: {str(e)}"

def save_summary_to_supabase(patient_id, summary_text):
    print(f"Upserting summary for {patient_id}...")
    # Using on_conflict=patient_id to update the existing record
    url = f"{SUPABASE_URL}/rest/v1/ai_summaries?on_conflict=patient_id"
    payload = {
        "patient_id": patient_id,
        "summary_text": summary_text,
        "model_used": "llama3",
        "created_at": datetime.utcnow().isoformat()
    }
    
    res = requests.post(url, headers=get_supabase_headers(upsert=True), json=payload)
    if res.status_code in [200, 201]:
        print("✅ Summary successfully refreshed!")
        return True
    else:
        print(f"❌ Failed to save summary: {res.text}")
        return False

def generate_summary(patient_id):
    """Integrated function to be called by the server"""
    raw_data = fetch_recovery_data(patient_id)
    if not raw_data:
        print("No recent data to summarize.")
        return False
        
    summary = get_ai_summary(raw_data)
    return save_summary_to_supabase(patient_id, summary)

if __name__ == "__main__":
    # For manual testing
    DEMO_ID = "de00dead-0000-4000-a000-000000000000"
    generate_summary(DEMO_ID)

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cloud Monitoring Dashboard - Backend Application
Author: Zakariae Elbouzidi
LinkedIn: https://www.linkedin.com/in/zakariae-elbouzidi/
GitHub: https://github.com/ZakBZD100

This is the main backend server for the Cloud Monitoring Dashboard.
It provides real-time monitoring capabilities with mandatory Ollama AI integration.
Built with FastAPI and WebSocket for real-time communication.
"""

import asyncio
import json
import logging
import time
import random
import sys
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import httpx
import os

#logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

#ollama ai setup

async def verify_ollama_required():
    """
    Verify that Ollama AI service is available and operational.
    This is a mandatory component for the dashboard to function properly.
    Without Ollama, the system will shut down to prevent degraded operation.
    """
    try:
        logger.info("Verifying Ollama AI service availability...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
#testing_ollama_connection
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
            response = await client.get(f"{ollama_url}/api/tags")
            
            if response.status_code != 200:
                raise Exception(f"Ollama API returned status {response.status_code}")
            
#checking_llama_model
            tags_data = response.json()
            models = [model.get("name", "") for model in tags_data.get("models", [])]
            
            llama_available = any("llama3.2:1b" in model for model in models)
            
            if not llama_available:
                raise Exception("Llama 3.2 1B model not found in Ollama")
            
#testing_model_response
            test_response = await client.post(
                f"{ollama_url}/api/generate",
                json={
                    "model": "llama3.2:1b",
                    "prompt": "System test: please respond with 'OK'",
                    "stream": False,
                    "options": {"num_ctx": 1024}
                },
                timeout=90.0
            )
            
            if test_response.status_code != 200:
                raise Exception("Llama model test failed")
            
            logger.info("Ollama AI service verified successfully")
            return True
            
    except Exception as e:
        logger.error(f"CRITICAL ERROR: Ollama AI service unavailable - {e}")
        logger.error("AI features disabled until Ollama is ready")
        logger.error("Required actions:")
        logger.error("   1. Install Ollama from https://ollama.ai")
        logger.error("   2. Run: ollama pull llama3.2:1b")
        logger.error("   3. Start: ollama serve")
        logger.error("   4. AI will auto-connect when ready")
        
#ai_not_ready_but_dashboard_works
        raise Exception(f"Ollama not ready: {e}")

#data_models

@dataclass
class Metrics:
    """
    Represents real-time system metrics.
    These metrics are simulated for demonstration purposes.
    """
    cpu_usage: float
    memory_usage: float
    api_latency: float
    error_rate: float
    timestamp: str
    active_incidents: List[str]
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Incident:
    """
    Defines a system incident that can be simulated.
    Each incident has specific impact on system metrics.
    """
    id: str
    name: str
    emoji: str
    description: str
    impact_metrics: Dict[str, tuple]
    duration_range: tuple
    severity: str

class IncidentConfig:
    """
    Configuration for available incident types.
    These incidents simulate common issues in cloud infrastructure.
    """
    
    INCIDENTS = {
        "cpu_spike": Incident(
            id="cpu_spike", name="CPU Spike", emoji="🔥",
            description="Critical CPU consumption spike affecting system performance",
            impact_metrics={"cpu_usage": (90, 95), "memory_usage": (10, 20)},
            duration_range=(30, 60), severity="CRITICAL"
        ),
        "memory_leak": Incident(
            id="memory_leak", name="Memory Leak", emoji="💾",
            description="Progressive memory leak causing gradual system degradation",
            impact_metrics={"memory_usage": (85, 95), "cpu_usage": (5, 15)},
            duration_range=(45, 90), severity="HIGH"
        ),
        "api_failure": Incident(
            id="api_failure", name="API Failure", emoji="💥",
            description="API service failure resulting in high error rates",
            impact_metrics={"error_rate": (10, 15), "api_latency": (500, 1000)},
            duration_range=(20, 45), severity="CRITICAL"
        ),
        "network_latency": Incident(
            id="network_latency", name="Network Latency", emoji="🌐",
            description="Network performance degradation causing high latency",
            impact_metrics={"api_latency": (800, 1200), "error_rate": (2, 5)},
            duration_range=(60, 120), severity="MEDIUM"
        )
    }

#websocket_manager

class ConnectionManager:
    """
    Manages WebSocket connections for real-time communication.
    Handles connection lifecycle, message broadcasting, and statistics.
    """
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_stats = {
            "total_connections": 0,
            "active_connections": 0,
            "messages_sent": 0
        }
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection and update statistics."""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_stats["total_connections"] += 1
        self.connection_stats["active_connections"] = len(self.active_connections)
        logger.info(f"New WebSocket connection established. Total active: {len(self.active_connections)}")
        
#welcome_message
        await self.send_personal_message({
            "type": "connection",
            "status": "connected",
            "message": "Welcome to Cloud Monitoring Dashboard - AI analysis ready",
            "timestamp": datetime.now().isoformat()
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection and update statistics."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        self.connection_stats["active_connections"] = len(self.active_connections)
        logger.info(f"WebSocket connection closed. Remaining active: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_text(json.dumps(message))
            self.connection_stats["messages_sent"] += 1
        except Exception as e:
            logger.error(f"Failed to send message to WebSocket: {e}")
    
    async def broadcast(self, message: dict):
        """Send a message to all active WebSocket connections."""
        if not self.active_connections:
            return
            
        disconnected = []
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(json.dumps(message))
                self.connection_stats["messages_sent"] += 1
            except Exception:
                disconnected.append(connection)

#cleanup_disconnected
        for connection in disconnected:
            self.disconnect(connection)

# ===============================================================================
#metrics simulator
# ===============================================================================

class MetricsSimulator:
    """Metrics simulator with incidents"""
    
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self.active_incidents: Dict[str, dict] = {}
        self.base_metrics = {
            "cpu_usage": 25.0,
            "memory_usage": 45.0,
            "api_latency": 120.0,
            "error_rate": 1.2
        }
        self.current_metrics = self.base_metrics.copy()
        self.metrics_history: List[Dict] = []
        self.is_running = False
        self.update_interval = 2.0
        
    def start_simulation(self):
        if self.is_running:
            return
        self.is_running = True
        logger.info("Starting metrics simulator with mandatory AI")
        asyncio.create_task(self._simulation_loop())
    
    def stop_simulation(self):
        self.is_running = False
        logger.info("Stopping simulator")
    
    async def _simulation_loop(self):
        while self.is_running:
            try:
                self._update_metrics()
                
                metrics = Metrics(
                    cpu_usage=round(self.current_metrics["cpu_usage"], 1),
                    memory_usage=round(self.current_metrics["memory_usage"], 1),
                    api_latency=round(self.current_metrics["api_latency"], 1),
                    error_rate=round(self.current_metrics["error_rate"], 2),
                    timestamp=datetime.now().isoformat(),
                    active_incidents=list(self.active_incidents.keys())
                )
                
                self.metrics_history.append(metrics.to_dict())
                if len(self.metrics_history) > 100:
                    self.metrics_history.pop(0)
                
                await self.connection_manager.broadcast({
                    "type": "metrics",
                    "data": metrics.to_dict(),
                    "incident_count": len(self.active_incidents),
                    "system_status": self._get_system_status(),
                    "ai_status": "active"  #ai always active
                })
                
                await self._manage_active_incidents()
                await asyncio.sleep(self.update_interval)
                
            except Exception as e:
                logger.error(f"Simulation error: {e}")
                await asyncio.sleep(1)
    
    def _update_metrics(self):
        #reset to base + natural variation
        for metric in self.current_metrics:
            base_value = self.base_metrics[metric]
            variation = random.uniform(-3, 3)
            self.current_metrics[metric] = max(0, base_value + variation)
        
        #impact of active incidents
        for incident_id in self.active_incidents:
            incident = IncidentConfig.INCIDENTS[incident_id]
            for metric, (min_impact, max_impact) in incident.impact_metrics.items():
                if metric in self.current_metrics:
                    impact = random.uniform(min_impact, max_impact)
                    if metric in ["cpu_usage", "memory_usage"]:
                        self.current_metrics[metric] = max(self.current_metrics[metric], impact)
                    else:
                        self.current_metrics[metric] += impact
        
        #limits
        self.current_metrics["cpu_usage"] = min(self.current_metrics["cpu_usage"], 98)
        self.current_metrics["memory_usage"] = min(self.current_metrics["memory_usage"], 95)
        self.current_metrics["api_latency"] = min(self.current_metrics["api_latency"], 2000)
        self.current_metrics["error_rate"] = min(self.current_metrics["error_rate"], 20)
    
    async def _manage_active_incidents(self):
        expired = []
        for incident_id in self.active_incidents:
            if time.time() - self.active_incidents[incident_id]["start_time"] >= self.active_incidents[incident_id]["duration"]:
                expired.append(incident_id)
        
        for incident_id in expired:
            await self.end_incident(incident_id)
    
    async def trigger_incident(self, incident_id: str) -> dict:
        if incident_id not in IncidentConfig.INCIDENTS:
            raise ValueError(f"Unknown incident: {incident_id}")
        
        if incident_id in self.active_incidents:
            return {"status": "error", "message": f"Incident {incident_id} already active"}
        
        incident = IncidentConfig.INCIDENTS[incident_id]
        duration = random.randint(*incident.duration_range)
        
        self.active_incidents[incident_id] = {
            "start_time": time.time(),
            "duration": duration,
            "severity": incident.severity
        }
        
        logger.info(f"Incident: {incident.name} ({duration}s)")
        
        await self.connection_manager.broadcast({
            "type": "incident",
            "incident_type": incident_id,
            "status": "start",
            "incident": {
                "id": incident_id,
                "name": incident.name,
                "emoji": incident.emoji,
                "description": incident.description,
                "severity": incident.severity,
                "duration": duration
            },
            "timestamp": datetime.now().isoformat()
        })
        
        return {"status": "success", "incident": incident.name, "duration": duration}
    
    async def trigger_multiple_incidents(self, incident_ids: List[str]) -> dict:
        results = []
        success_count = 0
        
        for incident_id in incident_ids:
            try:
                result = await self.trigger_incident(incident_id)
                results.append(result)
                if result["status"] == "success":
                    success_count += 1
            except Exception as e:
                results.append({"status": "error", "incident": incident_id, "error": str(e)})
        
        #mandatory ai analysis if multiple incidents
        if success_count >= 2:
            await self._trigger_ai_analysis()
        
        logger.info(f"Multi-incident: {success_count}/{len(incident_ids)}")
        
        return {
            "status": "completed",
            "triggered": success_count,
            "total": len(incident_ids),
            "results": results
        }
    
    async def end_incident(self, incident_id: str):
        if incident_id not in self.active_incidents:
            return
        
        incident = IncidentConfig.INCIDENTS[incident_id]
        del self.active_incidents[incident_id]
        
        logger.info(f"Resolved: {incident.name}")
        
        await self.connection_manager.broadcast({
            "type": "incident",
            "incident_type": incident_id,
            "status": "end",
            "incident": {"id": incident_id, "name": incident.name, "emoji": incident.emoji},
            "timestamp": datetime.now().isoformat()
        })
    
    def _get_system_status(self) -> str:
        if not self.active_incidents:
            return "normal"
        
        critical_count = sum(1 for data in self.active_incidents.values() 
                           if data["severity"] == "CRITICAL")
        
        if critical_count >= 2:
            return "critical"
        elif critical_count >= 1:
            return "warning"
        else:
            return "attention"
    
    async def _trigger_ai_analysis(self):
        try:
            active_incidents = [IncidentConfig.INCIDENTS[iid].name 
                              for iid in self.active_incidents.keys()]
            
            #mandatory ai - no fallback
            analysis = await analyze_with_ollama_required(
                incident_types=active_incidents,
                metrics=self.current_metrics,
                multi_incident=True
            )
            
            await self.connection_manager.broadcast({
                "type": "ai_insight", 
                "insight": analysis,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"MANDATORY AI analysis error: {e}")
            #no fallback - the error is critical

# ===============================================================================
#mandatory ollama ai
# ===============================================================================

async def analyze_with_ollama_required(incident_types: List[str], metrics: dict, multi_incident: bool = False) -> dict:
    """MANDATORY analysis with Ollama - No fallback mode"""
    
    try:
        if multi_incident and len(incident_types) >= 2:
            prompt = f"""System has multiple incidents: {', '.join(incident_types)}. CPU: {metrics['cpu_usage']:.1f}%, Memory: {metrics['memory_usage']:.1f}%. Provide 3 quick fixes."""
        elif incident_types:
            prompt = f"""System incident: {incident_types[0]}. CPU: {metrics['cpu_usage']:.1f}%, Memory: {metrics['memory_usage']:.1f}%. Give 2 recommendations."""
        else:
            prompt = f"""System status: CPU {metrics['cpu_usage']:.1f}%, Memory {metrics['memory_usage']:.1f}%. Give 2 optimization tips."""

        async with httpx.AsyncClient(timeout=120.0) as client:
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
            response = await client.post(
                f"{ollama_url}/api/generate",
                json={
                    "model": "llama3.2:1b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_ctx": 256}
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "title": "🤖 Ollama Llama AI Analysis",
                    "analysis": result.get("response", "").strip(),
                    "model": "llama3.2:1b",
                    "confidence": 0.90,
                    "status": "mandatory_active"
                }
            else:
                raise Exception(f"Ollama API error: {response.status_code}")
    
    except Exception as e:
        logger.error(f"CRITICAL MANDATORY AI ERROR: {e}")
        raise Exception(f"Ollama AI unavailable: {e}")

# ===============================================================================
#fastapi application
# ===============================================================================

app = FastAPI(
    title="🚀 Cloud Monitoring Dashboard API",
    description="Cloud monitoring backend with AI - Zakariae El Bouzidi",
    version="2.1.0",
    docs_url=None,  #disable auto-generated docs
    redoc_url=None  #disable redoc
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

#global instances
connection_manager = ConnectionManager()
simulator = MetricsSimulator(connection_manager)

#directory configuration
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
SITE_EXPLICATIF_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "site_explicatif")

#templates directory - docker compatible path
if os.path.exists("/app/templates"):
    TEMPLATES_DIR = "/app/templates"
else:
    TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "templates")

#templates configuration
templates = Jinja2Templates(directory=TEMPLATES_DIR)

async def download_and_wait_for_ollama():
    """Download model and wait for Ollama to be ready"""
    logger.info("🚀 Starting Cloud Monitoring Dashboard Setup...")
    logger.info("🔄 Initializing Ollama AI service...")
    max_attempts = 120  #10 minutes with 5 second intervals
    attempt = 0
    
    #wait for ollama to start
    logger.info("⏳ Waiting for Ollama to start...")
    while attempt < 60:  #wait up to 5 minutes for ollama to start
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
                response = await client.get(f"{ollama_url}")
                if response.status_code == 200:
                    logger.info("✅ Ollama service is running")
                    break
        except:
            pass
        attempt += 1
        await asyncio.sleep(5)
    
    if attempt >= 60:
        logger.error("❌ TIMEOUT: Ollama service not starting")
        return False
    
    #now download the model
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
            
            #check if model exists
            response = await client.get(f"{ollama_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                if any("llama3.2:1b" in model.get("name", "") for model in models):
                    logger.info("✅ Llama 3.2 1B model already present")
                    return True
            
            logger.info("🔄 DOWNLOADING: Llama 3.2 1B model (1.4GB)")
            logger.info("⏳ This may take 2-5 minutes - please wait...")
            logger.info("📊 Progress will be shown below:")
            
            response = await client.post(f"{ollama_url}/api/pull", json={"name": "llama3.2:1b"})
            if response.status_code == 200:
                logger.info("✅ Model download started successfully")
            else:
                logger.warning(f"❌ Failed to start download: {response.status_code}")
                return False
    except Exception as e:
        logger.warning(f"⚠️ Could not start download: {e}")
        return False
    
    #now wait for model to be ready
    attempt = 0
    while attempt < max_attempts:
        try:
            await verify_ollama_required()
            logger.info("✅ SUCCESS: Llama 3.2 1B model downloaded successfully!")
            logger.info("🤖 AI is now ready for use")
            logger.info("🚀 Dashboard will start automatically...")
            return True
        except Exception as e:
            attempt += 1
            if attempt == 1:
                logger.info("⏳ Waiting for model to finish downloading and loading...")
            
            if attempt % 12 == 0:  #every minute
                logger.info(f"⏳ Still waiting for AI model... ({attempt//12} minutes elapsed)")
            
            await asyncio.sleep(5)  #wait 5 seconds before next check
    
    logger.error("❌ TIMEOUT: Ollama AI not ready after 10 minutes")
    return False

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Cloud Monitoring Dashboard with MANDATORY AI")
    
    #download and wait for ollama to be ready
    if not await download_and_wait_for_ollama():
        logger.error("❌ TIMEOUT: Ollama AI not ready after 10 minutes")
        logger.error("💡 Please check your internet connection and try again")
        raise Exception("Ollama AI not ready - dashboard cannot start")
    
    #start simulator only after ollama is ready
    simulator.start_simulation()
    logger.info("🚀 Full system operational - AI active")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Stopping API + AI")
    simulator.stop_simulation()

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Home page with glassmorphism design"""
    try:
        #check system status for dynamic display
        async with httpx.AsyncClient(timeout=5.0) as client:
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
            response = await client.get(ollama_url)
            ollama_status = "operational" if response.status_code == 200 else "error"
    except:
        ollama_status = "error"
    
    context = {
        "request": request,
        "system_status": {
            "api": "operational",
            "websocket": "connected",
            "ollama": ollama_status,
            "dashboard": "ready"
        },
        "stats": {
            "active_incidents": len(simulator.active_incidents),
            "active_connections": len(connection_manager.active_connections),
            "uptime": "System operational"
        }
    }
    
    return templates.TemplateResponse("index.html", context)

@app.get("/dashboard", response_class=HTMLResponse)
async def get_dashboard(request: Request):
    """Serves the main dashboard page"""
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/docs", response_class=HTMLResponse)
@app.get("/docs/", response_class=HTMLResponse)
async def api_documentation(request: Request):
    """API documentation with glassmorphism design"""
    return templates.TemplateResponse("docs.html", {"request": request})

@app.get("/health")
async def health_check():
    #mandatory ai test
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
            response = await client.get(ollama_url)
            ollama_status = "operational" if response.status_code == 200 else "error"
    except:
        ollama_status = "critical_error"
        
    return {
        "status": "healthy" if ollama_status == "operational" else "degraded",
        "timestamp": datetime.now().isoformat(),
        "simulator_running": simulator.is_running,
        "active_incidents": len(simulator.active_incidents),
        "active_connections": len(connection_manager.active_connections),
        "ai_status": "mandatory",
        "ollama_status": ollama_status,
        "model": "llama3.2:1b"
    }

@app.get("/api/health")
async def api_health_check():
    """API health check endpoint"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
            response = await client.get(ollama_url)
            ollama_status = "operational" if response.status_code == 200 else "error"
    except:
        ollama_status = "critical_error"
        
    return {
        "status": "healthy" if ollama_status == "operational" else "degraded",
        "timestamp": datetime.now().isoformat(),
        "simulator_running": simulator.is_running,
        "active_incidents": len(simulator.active_incidents),
        "active_connections": len(connection_manager.active_connections),
        "ai_status": "mandatory",
        "ollama_status": ollama_status,
        "model": "llama3.2:1b"
    }

@app.get("/api/metrics")
async def get_current_metrics():
    if simulator.metrics_history:
        return simulator.metrics_history[-1]
    
    return {
        "cpu_usage": simulator.current_metrics["cpu_usage"],
        "memory_usage": simulator.current_metrics["memory_usage"],
        "api_latency": simulator.current_metrics["api_latency"],
        "error_rate": simulator.current_metrics["error_rate"],
        "timestamp": datetime.now().isoformat(),
        "active_incidents": list(simulator.active_incidents.keys()),
        "ai_status": "mandatory_active"
    }

@app.get("/api/incidents")
async def get_available_incidents():
    incidents = []
    for incident_id, incident in IncidentConfig.INCIDENTS.items():
        incidents.append({
            "id": incident.id,
            "name": incident.name,
            "emoji": incident.emoji,
            "description": incident.description,
            "severity": incident.severity,
            "active": incident_id in simulator.active_incidents
        })
    
    return {"incidents": incidents, "active_count": len(simulator.active_incidents)}

@app.post("/api/incidents/trigger")
async def trigger_single_incident(incident_data: dict):
    incident_id = incident_data.get("incident_id")
    if not incident_id:
        raise HTTPException(status_code=400, detail="incident_id is required")
    
    try:
        return await simulator.trigger_incident(incident_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/incidents/trigger-multiple")
async def trigger_multiple_incidents(incidents_data: dict):
    incident_ids = incidents_data.get("incident_ids", [])
    if not incident_ids:
        raise HTTPException(status_code=400, detail="incident_ids are required")
    
    return await simulator.trigger_multiple_incidents(incident_ids)

@app.get("/api/ai/analyze")
async def manual_ai_analysis():
    """MANDATORY manual AI analysis"""
    active_incidents = [IncidentConfig.INCIDENTS[iid].name 
                       for iid in simulator.active_incidents.keys()]
    
    try:
        analysis = await analyze_with_ollama_required(
            incident_types=active_incidents,
            metrics=simulator.current_metrics,
            multi_incident=len(active_incidents) >= 2
        )
        
        return {"analysis": analysis, "timestamp": datetime.now().isoformat()}
        
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Mandatory Ollama AI unavailable: {e}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    
    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await connection_manager.send_personal_message({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat(),
                        "ai_status": "mandatory_active"
                    }, websocket)
                    
            except asyncio.TimeoutError:
                await connection_manager.send_personal_message({
                    "type": "heartbeat",
                    "timestamp": datetime.now().isoformat()
                }, websocket)
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        connection_manager.disconnect(websocket)

#static file server for the dashboard (must be after all routes)
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════════╗
║                🚀 CLOUD MONITORING DASHBOARD                  ║
║                   🤖 MANDATORY OLLAMA AI                      ║
║                                                               ║
║  Author: Zakariae El Bouzidi                                  ║
║  LinkedIn: https://www.linkedin.com/in/zakariae-elbouzidi/    ║
║  GitHub: https://github.com/ZakBZD100                         ║
║                                                               ║
║  🏠 Explanatory site: http://localhost:8000                   ║
║  📊 Dashboard: http://localhost:8000/dashboard                ║
║  📚 API Docs: http://localhost:8000/docs                      ║
║  📡 WebSocket: ws://localhost:8000/ws                         ║
║  🤖 AI: MANDATORY Llama 3.2 1B                                ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 
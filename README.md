# 🚀 Cloud Monitoring Dashboard with AI Integration

<div align="center">

![Dashboard Demo](DISPLAY-LIGHT.gif)

**Professional Real-time Cloud Infrastructure Monitoring System**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Modern-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![AI Powered](https://img.shields.io/badge/AI-Llama%203.2%201B-purple?logo=ai)](https://llama.meta.com)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real%20Time-orange?logo=websocket)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![License](https://img.shields.io/badge/License-MIT-yellow?logo=opensource)](LICENSE)

*Built by [Zakariae El Bouzidi](https://linkedin.com/in/zakariae-elbouzidi)*

[🚀 Quick Start](#quick-start) • [📖 Documentation](#api-documentation) • [🐳 Docker Setup](#docker-deployment)

</div>

---

## 🌟 Overview

A **production-ready cloud monitoring dashboard** featuring real-time metrics visualization, intelligent incident simulation, and AI-powered analysis. Built for DevOps practitioners and system administrators who need professional monitoring capabilities.

### ✨ Key Features

- 🔥 **Real-time Monitoring** - Live CPU, memory, API latency, and error rate tracking
- 🤖 **AI Analysis** - Integrated Ollama + Llama 3.2 1B for intelligent system insights
- 🎨 **Modern UI** - Glassmorphism design with cyberpunk aesthetics
- ⚡ **WebSocket Integration** - Instant updates without page refresh
- 🚨 **Incident Simulation** - Multiple simultaneous incident types for testing
- 📊 **Interactive Charts** - Chart.js powered visualizations
- 🐳 **Docker Ready** - One-command deployment
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Method 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/ZakBZD100/Cloud-Monitoring-Dashboard.git
cd Cloud-Monitoring-Dashboard

# Start everything with Docker
docker-compose up --build -d

# Wait 2-3 minutes for AI model download
# Open browser: http://localhost:8000
```

### Method 2: Manual Setup

```bash
# Install Ollama AI
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2:1b
ollama serve

# Setup Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r cloud_monitoring_dashboard/backend/requirements.txt

# Start dashboard
cd cloud_monitoring_dashboard/backend
python main.py
```

**🎉 Access your dashboard at:** http://localhost:8000

---

## 📋 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 4GB | 8GB+ |
| **CPU** | 2 cores | 4+ cores |
| **Storage** | 2GB | 5GB+ |
| **OS** | Windows 10/11, macOS, Linux | Any |
| **Network** | Internet (for AI model) | Stable connection |

---

## 🏗️ Architecture

### 🛠️ Technology Stack

**Frontend:**
- HTML5, CSS3 (Glassmorphism), JavaScript ES6+
- Chart.js for interactive visualizations
- WebSocket for real-time communication
- Responsive design with modern animations

**Backend:**
- FastAPI (Python) - High-performance API framework
- WebSocket support for real-time updates
- Jinja2 templating engine
- Uvicorn ASGI server

**AI Integration:**
- Ollama runtime for local AI inference
- Llama 3.2 1B language model
- Automated incident analysis
- Intelligent system recommendations

**DevOps:**
- Docker & Docker Compose
- Multi-stage builds for optimization
- Volume management for data persistence
- Health checks and auto-restart policies

---

## 📊 Features Deep Dive

### 🔥 Real-time Monitoring
- **CPU Usage** - Live percentage with trend analysis
- **Memory Usage** - RAM consumption tracking
- **API Latency** - Response time monitoring
- **Error Rate** - System failure detection
- **WebSocket Status** - Connection health monitoring

### 🚨 Incident Simulation
- **CPU Spike** - Critical performance degradation
- **Memory Leak** - Progressive resource exhaustion  
- **API Failure** - Service unavailability simulation
- **Network Latency** - Communication delays
- **Multiple Incidents** - Simultaneous issue testing

### 🤖 AI Analysis Features
- **Automatic Analysis** - Triggered during incidents
- **Manual Analysis** - On-demand system evaluation
- **Intelligent Insights** - Llama 3.2 1B powered recommendations
- **Performance Scoring** - Overall system health rating
- **Trend Prediction** - Future issue identification

### 🎨 User Interface
- **Glassmorphism Design** - Modern translucent aesthetics
- **Cyberpunk Theme** - Neon colors and futuristic styling
- **Responsive Layout** - Mobile-first design approach
- **Interactive Charts** - Hover effects and animations
- **Real-time Updates** - Smooth transitions and live data

---

## 🐳 Docker Deployment

### Simple Deployment
```bash
docker-compose up --build -d
```

### Production Deployment
```bash
# With custom environment
OLLAMA_TIMEOUT=60 docker-compose up -d

# Scale services
docker-compose up --scale dashboard=3 -d

# Monitor logs
docker-compose logs -f dashboard
```

### Docker Architecture
```yaml
services:
  dashboard:    # FastAPI + Frontend
    ports: ["8000:8000"]
    depends_on: [ollama]
    
  ollama:       # AI Service
    ports: ["11434:11434"]
    volumes: [ollama_data:/root/.ollama]
```

---

## 📖 API Documentation

### Health Check
```http
GET /api/health
```
```json
{
  "status": "operational",
  "ollama_status": "operational", 
  "ai_status": "mandatory",
  "model": "llama3.2:1b"
}
```

### Current Metrics
```http
GET /api/metrics
```
```json
{
  "cpu_usage": 45.2,
  "memory_usage": 73.8,
  "api_latency": 67.5,
  "error_rate": 0.01,
  "active_incidents": ["memory_leak"]
}
```

### Trigger Incident
```http
POST /api/incidents/trigger
Content-Type: application/json

{
  "incident_id": "cpu_spike"
}
```

### AI Analysis
```http
GET /api/ai/analyze
```
```json
{
  "analysis": "System analysis complete...",
  "model": "llama3.2:1b",
  "confidence": 0.90
}
```

**📚 Complete API Reference:** http://localhost:8000/docs

---

## 🧪 Testing

### Automated Tests
```bash
# Health check
curl http://localhost:8000/api/health

# Metrics endpoint
curl http://localhost:8000/api/metrics

# AI analysis
curl http://localhost:8000/api/ai/analyze
```

### Manual Testing
1. **Dashboard Load** - Verify http://localhost:8000 loads
2. **Real-time Data** - Check metrics update every 2 seconds
3. **WebSocket** - Confirm "Connected" status in dashboard
4. **Incident Simulation** - Trigger CPU spike incident
5. **AI Analysis** - Request manual analysis and verify response

---

## 🔧 Configuration

### Environment Variables
```bash
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_TIMEOUT=30

# Dashboard Settings
DEBUG=false
LOG_LEVEL=INFO
MAX_CONNECTIONS=1000
```

### Custom Incidents
```python
# Add to IncidentConfig.INCIDENTS
"custom_incident": Incident(
    id="custom_incident",
    name="Custom Issue",
    description="Your custom incident description",
    impact_metrics={"cpu_usage": (80, 90)},
    duration_range=(30, 60),
    severity="HIGH"
)
```

---

## 📈 Performance

### Benchmarks
- **Response Time** - < 50ms average API response
- **WebSocket Latency** - < 10ms real-time updates  
- **Memory Usage** - ~200MB base consumption
- **CPU Usage** - < 5% idle, < 20% under load
- **Concurrent Users** - Tested up to 100 simultaneous connections

### Optimization Tips
- Use Docker for consistent performance
- Enable gzip compression for static files
- Configure reverse proxy (Nginx) for production
- Monitor resource usage with `docker stats`

---

## 🛠️ Development

### Project Structure
```
Cloud-Monitoring-Dashboard/
├── 🐳 docker-compose.yml          # Docker orchestration
├── 📚 DEPLOYMENT_GUIDE.md         # Deployment instructions
├── 🚀 LAUNCH_PROJECT.bat          # Windows launcher
├── cloud_monitoring_dashboard/
│   ├── backend/
│   │   ├── 🐍 main.py             # FastAPI application
│   │   └── 📦 requirements.txt    # Dependencies
│   └── frontend/
│       ├── 🎨 css/                # Stylesheets
│       ├── ⚡ js/                 # JavaScript
│       └── 🌐 index.html          # Dashboard UI
└── templates/
    ├── 🏠 index.html              # Homepage
    └── 📖 docs.html               # Documentation
```

### Local Development
```bash
# Backend development
cd cloud_monitoring_dashboard/backend
pip install -r requirements.txt
python main.py

# Frontend development
# Edit files in cloud_monitoring_dashboard/frontend/
# Changes reflect immediately (no build step required)
```

### Adding Features
1. **New Metrics** - Extend `MetricsSimulator` class
2. **Custom Incidents** - Add to `IncidentConfig.INCIDENTS`
3. **AI Prompts** - Modify `analyze_with_ollama_required()` function
4. **UI Components** - Edit HTML/CSS/JS in frontend directory

---

## 🔍 Troubleshooting

### Common Issues

**🐳 Docker Issues**
```bash
# Container not starting
docker-compose logs dashboard

# Port conflicts
docker-compose down && docker-compose up -d

# Clean restart
docker-compose down -v && docker-compose up --build -d
```

**🤖 AI Service Issues**
```bash
# Check Ollama status
docker-compose exec ollama ollama list

# Reinstall model
docker-compose exec ollama ollama pull llama3.2:1b

# Restart AI service
docker-compose restart ollama
```

**🌐 WebSocket Issues**
```bash
# Check connection in browser console
# Look for "WebSocket connected" message

# Verify backend is running
curl http://localhost:8000/api/health
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=true docker-compose up -d

# View detailed logs
docker-compose logs -f --tail=100 dashboard
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Free for personal and commercial use
✅ Commercial use    ✅ Modification    ✅ Distribution    ✅ Private use
```

---

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **Ollama** - Local AI inference platform  
- **Meta Llama** - Advanced language model
- **Chart.js** - Beautiful JavaScript charts
- **Docker** - Containerization platform

---

## 📞 Support & Contact

### 👨‍💻 Author
**Zakariae El Bouzidi**
- 🔗 LinkedIn: [zakariae-elbouzidi](https://linkedin.com/in/zakariae-elbouzidi)
- 💻 GitHub: [ZakBZD100](https://github.com/ZakBZD100)
- 📧 Email: zak.elbouzidi@gmail.com

---

<div align="center">

**⭐ Star this repository if it helped you!**

*Professional cloud monitoring solution*

</div> 
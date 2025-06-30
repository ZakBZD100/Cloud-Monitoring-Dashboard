# 🚀 Complete Deployment Guide - Cloud Monitoring Dashboard

**Author:** Zakariae El Bouzidi  
**Project:** Real-time Cloud Monitoring Dashboard with AI Integration  
**Target:** Beginner Computer Science/Engineering Students  

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start)
3. [Manual Installation](#manual-installation)
4. [Docker Deployment](#docker-deployment)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure](#project-structure)
8. [GitHub Deployment](#github-deployment)

---

## 🔧 Prerequisites

### Required Software
- **Docker Desktop** (Recommended - Easiest method)
- **Python 3.11+** (For manual installation)
- **Git** (For cloning/pushing to GitHub)
- **Web Browser** (Chrome/Firefox/Edge)

### System Requirements
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 2GB free space
- **OS:** Windows 10/11, macOS, or Linux
- **Network:** Internet connection for AI model download

---

## ⚡ Quick Start (5 minutes)

### Method 1: Docker (Recommended for Beginners)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd cloud-monitoring-dashboard

# 2. Start Docker Desktop (GUI application)

# 3. Launch the entire system
docker-compose up --build -d

# 4. Wait 2-3 minutes for AI model download
# 5. Open browser: http://localhost:8000
```

**That's it! 🎉 The dashboard is running!**

---

## 🛠️ Manual Installation

### Step 1: Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r cloud_monitoring_dashboard/backend/requirements.txt
```

### Step 2: Install Ollama AI

```bash
# Download and install Ollama
# Visit: https://ollama.ai/download

# Pull AI model (1.3GB download)
ollama pull llama3.2:1b

# Start Ollama service
ollama serve
```

### Step 3: Launch Application

```bash
# Navigate to backend
cd cloud_monitoring_dashboard/backend

# Start the server
python main.py
```

**Access:** http://localhost:8000

---

## 🐳 Docker Deployment (Recommended)

### Why Docker?
- ✅ **Zero configuration** - Everything works out of the box
- ✅ **Consistent environment** - Same behavior everywhere
- ✅ **Easy cleanup** - Remove everything with one command
- ✅ **Production-ready** - Scalable and maintainable

### Docker Commands

```bash
# Start everything
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Remove everything (including data)
docker-compose down -v
```

### Docker Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │     Ollama      │
│   (Port 8000)   │◄──►│   (Port 11434)  │
│   FastAPI +     │    │   Llama 3.2 1B  │
│   Frontend      │    │   AI Engine     │
└─────────────────┘    └─────────────────┘
```

---

## 🧪 Testing & Verification

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```
**Expected:** `{"status": "healthy", "ollama_status": "operational"}`

### 2. AI Test
```bash
curl http://localhost:8000/api/ai/analyze
```
**Expected:** AI analysis response with recommendations

### 3. WebSocket Test
- Open browser console on dashboard
- Check for WebSocket connection messages
- Verify real-time metrics updates

### 4. Incident Simulation
```bash
curl -X POST http://localhost:8000/api/incidents/trigger \
  -H "Content-Type: application/json" \
  -d '{"incident_id": "cpu_spike"}'
```

### 5. Complete Feature Test

| Feature | URL | Expected Result |
|---------|-----|-----------------|
| Homepage | http://localhost:8000 | System status overview |
| Dashboard | http://localhost:8000/dashboard | Interactive monitoring |
| API Docs | http://localhost:8000/docs | Complete API reference |
| Health Check | http://localhost:8000/api/health | System health status |
| Metrics | http://localhost:8000/api/metrics | Current system metrics |

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Docker not found"
```bash
# Solution: Install Docker Desktop
# Download from: https://docker.com/get-started
```

#### 2. "Port 8000 already in use"
```bash
# Solution: Kill existing process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

#### 3. "Ollama AI unavailable"
```bash
# Check Ollama container
docker-compose logs ollama

# Restart Ollama
docker-compose restart ollama

# Manually pull model
docker-compose exec ollama ollama pull llama3.2:1b
```

#### 4. "WebSocket connection failed"
```bash
# Check if dashboard is running
docker-compose ps

# Restart dashboard
docker-compose restart dashboard
```

#### 5. "AI analysis taking too long"
```bash
# Check system resources
docker stats

# Increase timeout (edit docker-compose.yml)
environment:
  - OLLAMA_TIMEOUT=60
```

### Debug Commands

```bash
# View all containers
docker ps -a

# Check container logs
docker-compose logs [service-name]

# Access container shell
docker-compose exec dashboard bash
docker-compose exec ollama bash

# Monitor resource usage
docker stats

# Clean up everything
docker system prune -a
```

---

## 📁 Project Structure

```
cloud-monitoring-dashboard/
├── 🐳 docker-compose.yml          # Docker orchestration
├── 🐳 Dockerfile                  # Container definition
├── 📚 DEPLOYMENT_GUIDE.md         # This guide
├── 📄 README.md                   # Project overview
├── 📄 LICENSE                     # MIT License
├── 🚀 LAUNCH_PROJECT.bat          # Windows launcher
├── 🚀 LAUNCH_PROJECT.sh           # Linux/macOS launcher
├── cloud_monitoring_dashboard/
│   ├── backend/
│   │   ├── 🐍 main.py             # FastAPI application
│   │   └── 📦 requirements.txt    # Python dependencies
│   └── frontend/
│       ├── 🎨 css/                # Stylesheets
│       ├── ⚡ js/                 # JavaScript
│       ├── 🖼️ icons8-layers-16.png # Favicon
│       └── 🌐 index.html          # Dashboard UI
└── templates/
    ├── 🏠 index.html              # Homepage
    └── 📖 docs.html               # API documentation
```

```
## 🎯 Success Criteria

Your deployment is successful when:

- ✅ **Homepage loads** at http://localhost:8000
- ✅ **Dashboard shows real-time metrics** with animated charts
- ✅ **AI analysis works** and provides intelligent insights
- ✅ **Incident simulation** triggers alerts and updates
- ✅ **WebSocket connection** shows "Connected" status
- ✅ **All API endpoints** return valid responses
- ✅ **Docker containers** are running without errors

---

## 📈 Next Steps

### For Learning
1. **Explore the code** - Understand FastAPI, WebSocket, AI integration
2. **Modify features** - Add new metrics, incident types, or AI prompts
3. **Extend functionality** - Add user authentication, data persistence
4. **Deploy to cloud** - AWS, Google Cloud, or Azure

### For Portfolio
1. **Document your changes** - Keep a development journal
2. **Create demo videos** - Show the dashboard in action
3. **Write blog posts** - Explain the technical challenges solved
4. **Present to peers** - Share your learning experience

---

## 🤝 Support

### Getting Help
- **GitHub Issues:** Report bugs or request features
- **Documentation:** Check README.md and code comments
- **Community:** Share your implementation experience

### Contributing
- Fork the repository
- Create feature branches
- Submit pull requests
- Follow coding standards

---

**🎉 Congratulations! You've successfully deployed a professional-grade cloud monitoring system with AI integration!**

---

*Built by Zakariae El Bouzidi* 
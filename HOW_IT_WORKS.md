# How It Works

A simple explanation of how this monitoring dashboard works.

## Basic Flow

1. **Backend starts** - Python FastAPI server starts on port 8000
2. **Frontend loads** - Browser loads the dashboard at http://localhost:8000
3. **WebSocket connects** - Real-time connection between browser and server
4. **Metrics simulate** - Fake system metrics get generated every 2 seconds
5. **Charts update** - Browser receives metrics and updates graphs
6. **AI analyzes** - When incidents happen, Ollama AI gives analysis

## The Components

### Backend (Python)
- **main.py** - The main server file
- **FastAPI** - Web framework that serves pages and API
- **WebSocket** - Sends live data to browser
- **Ollama integration** - Talks to AI for analysis

### Frontend (Browser)
- **index.html** - The dashboard page
- **dashboard.js** - Handles WebSocket, charts, UI updates
- **enhanced_styles.css** - Makes it look good with glassmorphism
- **Chart.js** - Library for drawing the graphs

### AI (Ollama)
- **Llama 3.2 1B** - The AI model that analyzes incidents
- **Local processing** - Everything stays on your computer
- **HTTP API** - Backend talks to Ollama via REST calls

## What happens when you trigger an incident?

1. You click "CPU Spike" incident
2. Frontend sends request to backend
3. Backend starts simulating high CPU usage
4. Metrics get updated with fake high values
5. WebSocket sends new data to frontend
6. Charts show the spike
7. If multiple incidents, AI analyzes the situation
8. Backend calls Ollama with incident details
9. AI returns analysis text
10. Frontend displays the AI response

## File structure explained

```
cloud_monitoring_dashboard/
├── backend/
│   ├── main.py              # Main server, has all the logic
│   └── requirements.txt     # Python packages needed
├── frontend/
│   ├── index.html          # The dashboard you see
│   ├── css/
│   │   ├── style.css       # Basic styling
│   │   ├── additional.css  # More styling
│   │   └── enhanced_styles.css  # Fancy glassmorphism effects
│   └── js/
│       └── dashboard.js    # All the frontend logic
```

## Key Technologies

**FastAPI** - Modern Python web framework
- Async/await support for performance
- Automatic API documentation
- WebSocket support built-in

**WebSocket** - Real-time communication
- Bi-directional data flow
- Low latency updates
- No need to refresh page

**Chart.js** - JavaScript charting library
- Smooth animations
- Real-time data updates
- Responsive design

**Ollama** - Local AI platform
- Runs AI models on your computer
- No internet needed after download
- RESTful API for integration

## The Tricky Parts

**WebSocket reconnection** - If connection drops, frontend tries to reconnect automatically with exponential backoff.

**Incident simulation** - Metrics are mathematically modeled to look realistic with noise and trends.

**AI prompting** - Backend builds detailed prompts with context about incidents and current system state.

**Memory management** - Only keeps last 100 metric points to avoid memory leaks.

**Error handling** - Lots of try/catch blocks because things can go wrong (network, AI, etc).

## Data Flow

```
User Action → Frontend → WebSocket → Backend → Ollama → Backend → WebSocket → Frontend → UI Update
```

Example:
1. User clicks "Memory Leak"
2. Frontend sends WebSocket message
3. Backend receives message
4. Backend starts memory leak simulation
5. Backend updates metrics
6. Backend calls Ollama for analysis
7. Ollama returns AI analysis
8. Backend sends updated metrics + AI response via WebSocket
9. Frontend receives data
10. Frontend updates charts and shows AI analysis

That's basically it! It's not rocket science, just a bunch of moving parts working together.

---

Built by Zakariae Elbouzidi
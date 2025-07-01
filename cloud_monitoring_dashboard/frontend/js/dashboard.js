/**
 * Cloud Monitoring Dashboard - Frontend Application
 * Author: Zakariae Elbouzidi
 * LinkedIn: https://www.linkedin.com/in/zakariae-elbouzidi/
 * GitHub: https://github.com/ZakBZD100
 * 
 * Main JavaScript controller for the cloud monitoring dashboard.
 * Handles real-time data visualization, WebSocket communication,
 * incident simulation, and AI analysis integration.
 */

class CloudMonitoringDashboard {
    constructor() {
        this.websocket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 1000;
        
        this.selectedIncidents = new Set();
        this.availableIncidents = [];
        this.currentMetrics = {};
        this.metricsHistory = [];
        this.charts = {};
        this.logs = [];
        this.aiStatus = 'checking'; //checking, active, error
        
        this.API_BASE = 'http://localhost:8000';
        this.WS_URL = 'ws://localhost:8000/ws';
        
        this.init();
    }

    //dashboard_initialization

    init() {
        console.log('Initializing Cloud Monitoring Dashboard with AI integration');
        this.addLog('INFO', 'Dashboard initialized - Built by Zakariae Elbouzidi');
        
        this.setupEventListeners();
        this.connectWebSocket();
        this.loadAvailableIncidents();
        this.initializeCharts();
        this.checkAIStatus();
        
//fallback_when_websocket_down
        setInterval(() => {
            if (!this.isConnected) {
                this.fetchCurrentMetrics();
            }
//checking_ai_status_every_30s
            if (Date.now() % 30000 < 5000) {
                this.checkAIStatus();
            }
        }, 5000);
    }

    setupEventListeners() {
        //incident buttons
        document.getElementById('btnSelectAll')?.addEventListener('click', () => this.selectAllIncidents());
        document.getElementById('btnSelectNone')?.addEventListener('click', () => this.selectNoIncidents());
        document.getElementById('btnLaunchSimultaneous')?.addEventListener('click', () => this.launchSimultaneousIncidents());
        
        //ai buttons
        document.getElementById('btnManualAnalysis')?.addEventListener('click', () => this.requestManualAnalysis());
        document.getElementById('btnClearAnalysis')?.addEventListener('click', () => this.clearAIAnalysis());
        
        //log buttons
        document.getElementById('btnClearLogs')?.addEventListener('click', () => this.clearLogs());

        document.getElementById('logsFilter')?.addEventListener('change', (e) => this.filterLogs(e.target.value));
        
        //chart controls
        document.querySelectorAll('.btn-chart-control').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeChartPeriod(e.target.dataset.period));
        });
    }

    //websocket_management

    connectWebSocket() {
        try {
            this.addLog('INFO', 'Attempting WebSocket connection...');
            this.updateConnectionStatus('connecting');
            
            this.websocket = new WebSocket(this.WS_URL);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connected successfully');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('online');
                this.addLog('SUCCESS', 'WebSocket connected - Real-time monitoring active');
                
//starting_heartbeat
                this.startHeartbeat();
            };
            
            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(JSON.parse(event.data));
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus('offline');
                this.addLog('WARNING', 'WebSocket disconnected - Attempting to reconnect...');
                
                this.scheduleReconnect();
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.addLog('ERROR', 'WebSocket error - Connection failed');
            };
            
        } catch (error) {
            console.error('WebSocket creation error:', error);
            this.addLog('ERROR', 'Could not create WebSocket connection');
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
            
            this.addLog('INFO', `Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectWebSocket();
            }, delay);
        } else {
            this.addLog('ERROR', 'WebSocket reconnection failed - Operating in degraded mode');
            this.updateConnectionStatus('offline');
        }
    }

    startHeartbeat() {
        setInterval(() => {
            if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'ping',
                    timestamp: new Date().toISOString()
                }));
            }
        }, 30000);
    }

    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'connection':
                this.handleConnectionMessage(message);
                break;
            case 'metrics':
                this.handleMetricsUpdate(message.data);
                if (message.ai_status) {
                    this.updateAIStatus('active');
                }
                break;
            case 'incident':
                this.handleIncidentNotification(message);
                break;
            case 'ai_insight':
                this.handleAIInsight(message.insight);
                break;
            case 'pong':
                //heartbeat response with ai status verification
                if (message.ai_status === 'mandatory_active') {
                    this.updateAIStatus('active');
                }
                break;
            default:
                console.log('Unhandled WebSocket message type:', message.type);
        }
    }

    //ai_status_monitoring

    async checkAIStatus() {
        try {
            const response = await fetch(`${this.API_BASE}/api/health`);
            const health = await response.json();
            
            if (health.ai_status === 'mandatory' && health.ollama_status === 'operational') {
                this.updateAIStatus('active');
                //clear error display if ai is now working
                if (this.aiStatus !== 'active') {
                    this.clearAIAnalysis();
                    this.addLog('SUCCESS', 'AI analysis service operational');
                }
            } else {
                this.updateAIStatus('error');
                this.showAIError();
                this.addLog('ERROR', 'AI analysis service unavailable');
            }
            
        } catch (error) {
            this.updateAIStatus('error');
            this.showAIError();
            this.addLog('ERROR', 'Could not check AI status');
        }
    }

    updateAIStatus(status) {
        this.aiStatus = status;
        const indicator = document.getElementById('aiIndicator');
        const statusText = document.getElementById('aiStatusText');
        
        if (indicator) {
            indicator.className = `ai-indicator ${status}`;
        }
        
        if (statusText) {
            switch (status) {
                case 'checking':
                    statusText.textContent = 'Checking AI...';
                    break;
                case 'active':
                    statusText.textContent = 'Ollama AI Active';
                    statusText.style.color = '#22c55e';
                    break;
                case 'error':
                    statusText.textContent = 'MANDATORY AI Unavailable';
                    statusText.style.color = '#ef4444';
                    break;
            }
        }
        
                        //disable features if ai is unavailable
        const aiButtons = document.querySelectorAll('.btn-ai-analyze, .btn-launch-simultaneous');
        aiButtons.forEach(btn => {
            if (status === 'error') {
                btn.disabled = true;
                btn.title = 'Mandatory Ollama AI is unavailable';
            } else {
                btn.disabled = false;
                btn.title = '';
            }
        });
    }

    // ===============================================================================
    //incident management
    // ===============================================================================

    async loadAvailableIncidents() {
        try {
            const response = await fetch(`${this.API_BASE}/api/incidents`);
            const data = await response.json();
            
            this.availableIncidents = data.incidents;
            this.renderIncidentsGrid();
            this.addLog('SUCCESS', `✅ ${data.incidents.length} incident types loaded`);
            
        } catch (error) {
                    console.error('Error loading incidents:', error);
        this.addLog('ERROR', 'Could not load incident types');
        }
    }

    renderIncidentsGrid() {
        const grid = document.getElementById('incidentsGrid');
        if (!grid) return;

        grid.innerHTML = this.availableIncidents.map(incident => `
            <div class="incident-card ${incident.active ? 'active' : ''}" 
                 data-incident-id="${incident.id}">
                <div class="incident-header">
                    <div class="incident-emoji">${incident.emoji}</div>
                    <div class="incident-title">${incident.name}</div>
                </div>
                <div class="incident-description">${incident.description}</div>
                <div class="incident-status">
                    <span class="status-label">Status:</span>
                    <span class="status-value ${incident.active ? 'critical' : 'normal'}">
                        ${incident.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span class="severity ${incident.severity.toLowerCase()}">${incident.severity}</span>
                </div>
            </div>
        `).join('');

                    //event listeners for selection
        grid.querySelectorAll('.incident-card').forEach(card => {
            card.addEventListener('click', () => {
                const incidentId = card.dataset.incidentId;
                
                if (card.classList.contains('active')) {
                    this.addLog('WARNING', `⚠️ Incident ${incidentId} already active`);
                    return;
                }
                
                if (this.selectedIncidents.has(incidentId)) {
                    this.selectedIncidents.delete(incidentId);
                    card.classList.remove('selected');
                } else {
                    this.selectedIncidents.add(incidentId);
                    card.classList.add('selected');
                }
                
                this.updateIncidentCounter();
            });
        });
    }

    selectAllIncidents() {
        this.selectedIncidents.clear();
        
        this.availableIncidents.forEach(incident => {
            if (!incident.active) {
                this.selectedIncidents.add(incident.id);
            }
        });
        
        this.updateIncidentSelection();
        this.updateIncidentCounter();
        this.addLog('INFO', `📋 ${this.selectedIncidents.size} incidents selected`);
    }

    selectNoIncidents() {
        this.selectedIncidents.clear();
        this.updateIncidentSelection();
        this.updateIncidentCounter();
        this.addLog('INFO', '📋 Incident selection cleared');
    }

    updateIncidentSelection() {
        document.querySelectorAll('.incident-card').forEach(card => {
            const incidentId = card.dataset.incidentId;
            if (this.selectedIncidents.has(incidentId)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    updateIncidentCounter() {
        const counter = document.getElementById('selectedCount');
        const launchBtn = document.getElementById('btnLaunchSimultaneous');
        
        if (counter) {
            counter.textContent = this.selectedIncidents.size;
        }
        
        if (launchBtn) {
            const isDisabled = this.selectedIncidents.size === 0 || this.aiStatus === 'error';
            launchBtn.disabled = isDisabled;
            
            if (this.aiStatus === 'error') {
                launchBtn.textContent = `🤖 MANDATORY AI REQUIRED`;
                launchBtn.title = 'Ollama + Llama 3.2 1B required for operation';
            } else {
                launchBtn.textContent = `🚀 LAUNCH SIMULTANEOUSLY (${this.selectedIncidents.size})`;
                launchBtn.title = '';
            }
        }
    }

    async launchSimultaneousIncidents() {
        if (this.selectedIncidents.size === 0) {
            this.addLog('WARNING', '⚠️ No incidents selected');
            return;
        }

        if (this.aiStatus === 'error') {
            this.addLog('ERROR', 'AI analysis service unavailable - Function blocked');
            return;
        }

        const incidentIds = Array.from(this.selectedIncidents);
        
        try {
            this.addLog('INFO', `🚀 Launching ${incidentIds.length} simultaneous incidents...`);
            
            const response = await fetch(`${this.API_BASE}/api/incidents/trigger-multiple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ incident_ids: incidentIds })
            });
            
            const result = await response.json();
            
            this.addLog('SUCCESS', `✅ ${result.triggered}/${result.total} incidents triggered successfully`);
            
            if (result.triggered >= 2) {
                this.addLog('AI', '🤖 Automatic AI analysis triggered for multi-incident');
            }
            
            //reset selection
            this.selectedIncidents.clear();
            this.updateIncidentCounter();
            
            //reload incident list
            setTimeout(() => this.loadAvailableIncidents(), 1000);
            
        } catch (error) {
                    console.error('Error launching incidents:', error);
        this.addLog('ERROR', 'Failed to launch incidents');
        }
    }

    handleIncidentNotification(message) {
        const { incident_type, status, incident } = message;
        
        if (status === 'start') {
            this.addLog('ERROR', `🔥 INCIDENT: ${incident.name} (${incident.severity}) - Estimated duration: ${incident.duration}s`);
        } else if (status === 'end') {
            this.addLog('SUCCESS', `✅ RESOLVED: ${incident.name}`);
        }
        
                    //reload incidents to update status
        this.loadAvailableIncidents();
    }

    // ===============================================================================
    //real-time metrics
    // ===============================================================================

    async fetchCurrentMetrics() {
        try {
            const response = await fetch(`${this.API_BASE}/api/metrics`);
            const metrics = await response.json();
            this.handleMetricsUpdate(metrics);
            
            //check ai status in the response
            if (metrics.ai_status === 'mandatory_active') {
                this.updateAIStatus('active');
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    }

    handleMetricsUpdate(metrics) {
        this.currentMetrics = metrics;
        this.metricsHistory.push({
            ...metrics,
            timestamp: new Date()
        });
        
                    //keep only the last 100 data points
        if (this.metricsHistory.length > 100) {
            this.metricsHistory.shift();
        }
        
        this.updateMetricsDisplay();
        this.updateCharts();
        this.updateLastUpdate();
        this.updateSystemStatus();
    }

    updateMetricsDisplay() {
        const metrics = this.currentMetrics;
        
                    //cpu
        this.updateMetricCard('cpu', metrics.cpu_usage, '%', this.getCPUStatus(metrics.cpu_usage));
        
                    //memory
        this.updateMetricCard('memory', metrics.memory_usage, '%', this.getMemoryStatus(metrics.memory_usage));
        
                    //latency
        this.updateMetricCard('latency', metrics.api_latency, 'ms', this.getLatencyStatus(metrics.api_latency));
        
                    //errors
        this.updateMetricCard('error', metrics.error_rate, '%', this.getErrorStatus(metrics.error_rate));
    }

    updateMetricCard(type, value, unit, status) {
        const valueEl = document.getElementById(`${type}Value`);
        const statusEl = document.getElementById(`${type}Status`);
        const progressEl = document.getElementById(`${type}Progress`);
        const trendEl = document.getElementById(`${type}Trend`);
        const cardEl = document.getElementById(`${type}Card`);
        
        if (valueEl) valueEl.textContent = `${Math.round(value * 10) / 10}${unit}`;
        if (statusEl) {
            statusEl.textContent = status.label;
            statusEl.className = `metric-status ${status.level}`;
        }
        
        if (progressEl) {
            const percentage = this.getProgressPercentage(type, value);
            progressEl.style.width = `${percentage}%`;
        }
        
        if (cardEl) {
            cardEl.className = `metric-card glass-card ${status.level}`;
        }
        
        if (trendEl) {
            const trend = this.calculateTrend(type);
            trendEl.textContent = `Trend: ${trend.icon} ${trend.text}`;
        }
    }

    getCPUStatus(cpu) {
        if (cpu >= 95) return { level: 'critical', label: 'CRITICAL' };
        if (cpu >= 80) return { level: 'warning', label: 'HIGH' };
        if (cpu >= 60) return { level: 'warning', label: 'WARNING' };
        return { level: 'normal', label: 'NORMAL' };
    }

    getMemoryStatus(memory) {
        if (memory >= 95) return { level: 'critical', label: 'CRITICAL' };
        if (memory >= 85) return { level: 'warning', label: 'SATURATED' };
        if (memory >= 70) return { level: 'warning', label: 'HIGH' };
        return { level: 'normal', label: 'NORMAL' };
    }

    getLatencyStatus(latency) {
        if (latency >= 500) return { level: 'critical', label: 'CRITICAL' };
        if (latency >= 200) return { level: 'warning', label: 'SLOW' };
        if (latency >= 100) return { level: 'warning', label: 'FAIR' };
        return { level: 'normal', label: 'FAST' };
    }

    getErrorStatus(error) {
        if (error >= 5) return { level: 'critical', label: 'CRITICAL' };
        if (error >= 2) return { level: 'warning', label: 'CONCERNING' };
        if (error >= 1) return { level: 'warning', label: 'ACCEPTABLE' };
        return { level: 'normal', label: 'EXCELLENT' };
    }

    getProgressPercentage(type, value) {
        switch (type) {
            case 'cpu':
            case 'memory':
                return Math.min(value, 100);
            case 'latency':
                return Math.min((value / 1000) * 100, 100);
            case 'error':
                return Math.min((value / 20) * 100, 100);
            default:
                return 0;
        }
    }

    calculateTrend(type) {
        if (this.metricsHistory.length < 5) {
            return { icon: '➡️', text: 'Stable' };
        }
        
        const recent = this.metricsHistory.slice(-5);
        const key = type === 'cpu' ? 'cpu_usage' : 
                   type === 'memory' ? 'memory_usage' :
                   type === 'latency' ? 'api_latency' : 'error_rate';
        
        const values = recent.map(m => m[key]);
        const first = values[0];
        const last = values[values.length - 1];
        
        const change = ((last - first) / first) * 100;
        
        if (change > 10) return { icon: '📈', text: 'Increasing' };
        if (change < -10) return { icon: '📉', text: 'Decreasing' };
        return { icon: '➡️', text: 'Stable' };
    }

    updateLastUpdate() {
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleTimeString('en-US');
        }
    }

    updateSystemStatus() {
        const statusEl = document.getElementById('systemStatusValue');
        if (!statusEl) return;
        
        const metrics = this.currentMetrics;
        const activeIncidents = metrics.active_incidents?.length || 0;
        
        let status = 'normal';
        let label = 'NORMAL';
        
        if (activeIncidents >= 2) {
            status = 'critical';
            label = 'CRITICAL';
        } else if (activeIncidents >= 1) {
            status = 'warning';
            label = 'WARNING';
        } else if (metrics.cpu_usage >= 80 || metrics.memory_usage >= 85 || metrics.error_rate >= 5) {
            status = 'warning';
            label = 'WARNING';
        }
        
        statusEl.textContent = label;
        statusEl.className = `status-value ${status}`;
    }

    // ===============================================================================
    //graphiques
    // ===============================================================================

    initializeCharts() {
        const chartConfigs = [
            { id: 'cpuChart', label: 'CPU (%)', color: '#3b82f6', key: 'cpu_usage' },
            { id: 'memoryChart', label: 'Memory (%)', color: '#22c55e', key: 'memory_usage' },
            { id: 'latencyChart', label: 'Latency (ms)', color: '#f59e0b', key: 'api_latency' },
            { id: 'errorChart', label: 'Errors (%)', color: '#ef4444', key: 'error_rate' }
        ];

        chartConfigs.forEach(config => {
            const canvas = document.getElementById(config.id);
            if (canvas) {
                this.charts[config.key] = new Chart(canvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: config.label,
                            data: [],
                            borderColor: config.color,
                            backgroundColor: config.color + '20',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 2,
                            pointBackgroundColor: config.color
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    font: {
                                        size: 11,
                                        weight: '500'
                                    },
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            }
                        },
                        scales: {
                            x: {
                                display: false
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(255,255,255,0.1)'
                                },
                                ticks: {
                                    color: 'rgba(255,255,255,0.7)',
                                    font: {
                                        size: 10
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    updateCharts() {
        if (this.metricsHistory.length === 0) return;

        const recent = this.metricsHistory.slice(-50); //last 50 points
        const labels = recent.map(m => new Date(m.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        }));

        Object.keys(this.charts).forEach(key => {
            const chart = this.charts[key];
            const data = recent.map(m => m[key] || 0);
            
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update('none');
        });
    }

    changeChartPeriod(period) {
        //update active buttons
        document.querySelectorAll('.btn-chart-control').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-period="${period}"]`)?.classList.add('active');
        
        //logic to change chart period
        let points = 50;
        switch (period) {
            case '5m': points = 25; break;
            case '15m': points = 50; break;
            case '1h': points = 100; break;
        }
        
        this.addLog('INFO', `📈 Chart period changed: ${period}`);
    }

    // ===============================================================================
    //mandatory ollama ai
    // ===============================================================================

    async requestManualAnalysis() {
        if (this.aiStatus === 'error') {
            this.addLog('ERROR', 'AI analysis service unavailable - Analysis impossible');
            this.showAIError();
            return;
        }

        try {
            this.addLog('INFO', '🤖 Requesting manual AI analysis...');
            this.updateAIStatusDisplay('analyzing');
            
            const response = await fetch(`${this.API_BASE}/api/ai/analyze`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.analysis) {
                this.handleAIInsight(data.analysis);
                this.addLog('SUCCESS', '✅ Ollama AI analysis complete');
            } else {
                throw new Error('No analysis response');
            }
            
        } catch (error) {
                    console.error('AI analysis error:', error);
        this.addLog('ERROR', 'AI analysis error - Please check service status');
            this.updateAIStatus('error');
            this.showAIError();
        }
    }

    handleAIInsight(insight) {
        const aiContent = document.getElementById('aiContent');
        if (!aiContent) return;

        aiContent.innerHTML = `
            <div class="ai-analysis animate-slide-in">
                <div class="ai-analysis-title">${insight.title}</div>
                <div class="ai-analysis-content">${insight.analysis}</div>
                <div style="margin-top: 1rem; font-size: 0.875rem; color: rgba(255,255,255,0.6);">
                    Model: ${insight.model} | Confidence: ${Math.round(insight.confidence * 100)}%
                    ${insight.status ? `| Status: ${insight.status}` : ''}
                </div>
            </div>
        `;

        this.updateAIStatus('active');
        this.addLog('AI', `🤖 ${insight.title}`);
    }

    clearAIAnalysis() {
        const aiContent = document.getElementById('aiContent');
        if (aiContent) {
            if (this.aiStatus === 'active') {
                aiContent.innerHTML = `
                    <div class="ai-placeholder">
                        <div class="ai-icon" style="color: #22c55e;">🤖</div>
                        <div class="ai-text">
                            <strong>AI Analysis Ready</strong><br>
                            Ollama + Llama 3.2 1B operational<br>
                            <small>Trigger incidents or click "Request Manual Analysis"</small>
                        </div>
                    </div>
                `;
            } else {
                aiContent.innerHTML = `
                    <div class="ai-placeholder">
                        <div class="ai-icon">🧠</div>
                        <div class="ai-text">
                            Waiting for incidents to analyze...<br>
                            <small>The AI will automatically analyze multi-simultaneous incidents</small>
                            <br><small class="ai-required">🤖 MANDATORY Ollama + Llama 3.2 1B REQUIRED</small>
                        </div>
                    </div>
                `;
            }
        }
        
        if (this.aiStatus === 'active') {
            this.addLog('INFO', '🤖 AI analysis ready');
        } else {
            this.addLog('INFO', '🗑️ AI analysis cleared');
        }
    }

    showAIError() {
        const aiContent = document.getElementById('aiContent');
        if (aiContent) {
            aiContent.innerHTML = `
                <div class="ai-error">
                    <div class="ai-icon" style="color: #ef4444;">🚨</div>
                    <div class="ai-text">
                        <strong>MANDATORY OLLAMA AI UNAVAILABLE</strong><br>
                        The dashboard requires Ollama + Llama 3.2 1B to function.<br><br>
                        <small>Solutions:</small><br>
                        <small>• Check if Ollama is started: <code>ollama serve</code></small><br>
                        <small>• Install Llama: <code>ollama pull llama3.2:1b</code></small><br>
                        <small>• Restart the backend after fixing</small>
                    </div>
                </div>
            `;
        }
    }

    updateAIStatusDisplay(status) {
        const indicator = document.getElementById('aiIndicator');
        const statusText = document.getElementById('aiStatusText');
        
        if (indicator) {
            indicator.className = `ai-indicator ${status}`;
        }
        
        if (statusText) {
            switch (status) {
                case 'analyzing':
                    statusText.textContent = 'AI analysis in progress...';
                    break;
                case 'active':
                    statusText.textContent = 'Ollama AI Active';
                    break;
                case 'error':
                    statusText.textContent = 'MANDATORY AI Unavailable';
                    break;
            }
        }
    }

    // ===============================================================================
    //system logs
    // ===============================================================================

    addLog(type, message) {
        const timestamp = new Date().toLocaleTimeString('en-US');
        const logEntry = {
            time: timestamp,
            type: type,
            message: message,
            id: Date.now()
        };
        
        this.logs.push(logEntry);
        
        //keep only the last 200 logs
        if (this.logs.length > 200) {
            this.logs.shift();
        }
        
        this.renderLogs();
    }

    renderLogs() {
        const container = document.getElementById('logsContainer');
        if (!container) return;
        
        //show all logs since there's no filter dropdown anymore
        let filteredLogs = this.logs;
        
        const logsHtml = filteredLogs.slice(-50).map(log => `
            <div class="log-entry log-${log.type.toLowerCase()}">
                <span class="log-time">${log.time}</span>
                <span class="log-type">${log.type}</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
        
        container.innerHTML = logsHtml;
        
        //no auto-scroll anymore
    }

    clearLogs() {
        this.logs = [];
        this.renderLogs();
        this.addLog('INFO', '🗑️ System logs cleared');
    }



    filterLogs(filter) {
        this.renderLogs();
        this.addLog('INFO', `🔍 Log filter: ${filter}`);
    }

    // ===============================================================================
    //utilities
    // ===============================================================================

    updateConnectionStatus(status) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (indicator) {
            indicator.className = `status-indicator ${status}`;
        }
        
        if (statusText) {
            switch (status) {
                case 'connecting':
                    statusText.textContent = 'Connecting...';
                    break;
                case 'online':
                    statusText.textContent = 'Connected + AI';
                    break;
                case 'offline':
                    statusText.textContent = 'Disconnected';
                    break;
            }
        }
    }

    handleConnectionMessage(message) {
        this.addLog('SUCCESS', message.message);
        //check if ai is mentioned in the connection message
        if (message.message.includes('AI') || message.message.includes('Ollama')) {
            this.updateAIStatus('active');
        }
    }
}

// ===============================================================================
//initialisation globale
// ===============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Cloud Monitoring Dashboard - MANDATORY Ollama AI');
    window.dashboard = new CloudMonitoringDashboard();
});

//export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudMonitoringDashboard;
} 
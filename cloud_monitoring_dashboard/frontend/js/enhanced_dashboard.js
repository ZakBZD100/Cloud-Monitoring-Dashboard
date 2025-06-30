/**
 * 🚀 Enhanced Cloud Monitoring Dashboard - JavaScript Extensions
 * Author: Zakariae El Bouzidi
 * GitHub: https://github.com/ZakBZD100
 */

class EnhancedCloudMonitoringDashboard {
    constructor() {
        this.performanceMetrics = {
            startTime: performance.now(),
            wsLatency: [],
            renderTime: [],
            memoryUsage: []
        };
        
        this.notifications = [];
        this.keyboardShortcuts = new Map();
        this.init();
    }

    init() {
        console.log('🚀 Enhanced Dashboard Extensions Loaded');
        this.setupKeyboardShortcuts();
        this.setupNotificationSystem();
        this.startPerformanceMonitoring();
    }

    setupKeyboardShortcuts() {
        this.keyboardShortcuts.set('ctrl+shift+s', () => this.selectAllIncidents());
        this.keyboardShortcuts.set('ctrl+shift+n', () => this.selectNoIncidents());
        this.keyboardShortcuts.set('ctrl+shift+l', () => this.launchSimultaneousIncidents());
        this.keyboardShortcuts.set('ctrl+shift+a', () => this.requestAdvancedAnalysis());
        this.keyboardShortcuts.set('ctrl+shift+c', () => this.clearAIAnalysis());
        
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcut(e));
    }

    handleKeyboardShortcut(event) {
        const shortcut = this.getShortcutString(event);
        const action = this.keyboardShortcuts.get(shortcut);
        
        if (action) {
            event.preventDefault();
            action();
            this.showNotification('success', `Keyboard shortcut executed: ${shortcut}`);
        }
    }

    getShortcutString(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('ctrl');
        if (event.shiftKey) parts.push('shift');
        if (event.altKey) parts.push('alt');
        if (event.metaKey) parts.push('meta');
        
        if (event.key.length === 1) {
            parts.push(event.key.toLowerCase());
        }
        
        return parts.join('+');
    }

    setupNotificationSystem() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    showNotification(type, message, duration = 5000) {
        const notification = {
            id: Date.now(),
            type: type,
            message: message,
            timestamp: new Date().toISOString(),
            duration: duration
        };
        
        this.notifications.push(notification);
        this.renderNotification(notification);
        
        if (type === 'critical' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Critical Alert - Cloud Monitor', {
                body: message,
                icon: '/favicon.ico',
                tag: 'critical-alert'
            });
        }
        
        setTimeout(() => this.removeNotification(notification.id), duration);
    }

    renderNotification(notification) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.id = `notification-${notification.id}`;
        notificationEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(notification.type)}</div>
                <div class="notification-message">${notification.message}</div>
                <button class="notification-close" onclick="enhancedDashboard.removeNotification(${notification.id})">×</button>
            </div>
        `;
        
        container.appendChild(notificationEl);
        setTimeout(() => notificationEl.classList.add('notification-show'), 100);
    }

    removeNotification(id) {
        const notificationEl = document.getElementById(`notification-${id}`);
        if (notificationEl) {
            notificationEl.classList.remove('notification-show');
            setTimeout(() => notificationEl.remove(), 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            critical: '🚨',
            info: 'ℹ️',
            ai: '🤖'
        };
        return icons[type] || 'ℹ️';
    }

    startPerformanceMonitoring() {
        this.performanceMetrics = {
            startTime: performance.now(),
            wsLatency: [],
            renderTime: [],
            memoryUsage: []
        };
        
        setInterval(() => this.measureWebSocketLatency(), 10000);
        
        if (performance.memory) {
            setInterval(() => this.trackMemoryUsage(), 30000);
        }
    }

    measureWebSocketLatency() {
        if (window.dashboard && window.dashboard.websocket && window.dashboard.websocket.readyState === WebSocket.OPEN) {
            const startTime = performance.now();
            const message = {
                type: 'ping',
                timestamp: new Date().toISOString(),
                pingTime: startTime
            };
            window.dashboard.websocket.send(JSON.stringify(message));
        }
    }

    trackMemoryUsage() {
        if (performance.memory) {
            const memoryInfo = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: new Date().toISOString()
            };
            
            this.performanceMetrics.memoryUsage.push(memoryInfo);
            
            if (this.performanceMetrics.memoryUsage.length > 100) {
                this.performanceMetrics.memoryUsage.shift();
            }
        }
    }

    // Enhanced AI Analysis
    async requestAdvancedAnalysis() {
        if (window.dashboard) {
            return window.dashboard.requestManualAnalysis();
        }
    }

    clearAIAnalysis() {
        if (window.dashboard) {
            return window.dashboard.clearAIAnalysis();
        }
    }

    selectAllIncidents() {
        if (window.dashboard) {
            return window.dashboard.selectAllIncidents();
        }
    }

    selectNoIncidents() {
        if (window.dashboard) {
            return window.dashboard.selectNoIncidents();
        }
    }

    launchSimultaneousIncidents() {
        if (window.dashboard) {
            return window.dashboard.launchSimultaneousIncidents();
        }
    }

    resetSession() {
        this.notifications = [];
        this.performanceMetrics = {
            startTime: performance.now(),
            wsLatency: [],
            renderTime: [],
            memoryUsage: []
        };
        
        this.showNotification('info', 'Session reset successfully');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.showNotification('info', 'Entered fullscreen mode');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.showNotification('info', 'Exited fullscreen mode');
            }
        }
    }

    exportLogsToJSON() {
        if (window.dashboard && window.dashboard.logs) {
            const logs = JSON.stringify(window.dashboard.logs, null, 2);
            this.downloadFile(logs, 'cloud-monitoring-logs.json', 'application/json');
            this.showNotification('success', 'Logs exported to JSON successfully');
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}

// Initialize Enhanced Dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window !== 'undefined') {
        window.enhancedDashboard = new EnhancedCloudMonitoringDashboard();
    }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCloudMonitoringDashboard;
} 
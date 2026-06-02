import { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, Info, AlertTriangle, X, Bell 
} from 'lucide-react';
import './RealTimeAlerts.css';

function RealTimeAlerts({ maxAlerts = 5, position = 'top-right' }) {
  const [alerts, setAlerts] = useState([]);

  // Listen for custom alert events
  useEffect(() => {
    const handleAlert = (event) => {
      const alert = {
        id: Date.now() + Math.random(),
        type: event.detail.type || 'info',
        title: event.detail.title || 'Notification',
        message: event.detail.message,
        duration: event.detail.duration || 5000,
        timestamp: new Date()
      };

      setAlerts(prev => {
        const newAlerts = [alert, ...prev].slice(0, maxAlerts);
        return newAlerts;
      });

      // Auto-remove after duration
      if (alert.duration > 0) {
        setTimeout(() => {
          removeAlert(alert.id);
        }, alert.duration);
      }
    };

    window.addEventListener('realtime-alert', handleAlert);
    return () => window.removeEventListener('realtime-alert', handleAlert);
  }, [maxAlerts]);

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info':
      default: return Info;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info':
      default: return '#3b82f6';
    }
  };

  return (
    <div className={`realtime-alerts-container ${position}`}>
      {alerts.map(alert => {
        const Icon = getAlertIcon(alert.type);
        const color = getAlertColor(alert.type);

        return (
          <div 
            key={alert.id} 
            className={`realtime-alert ${alert.type}`}
            style={{ borderLeftColor: color }}
          >
            <div className="alert-icon" style={{ color }}>
              <Icon size={16} />
            </div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-timestamp">
                {alert.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <button 
              className="alert-close"
              onClick={() => removeAlert(alert.id)}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to trigger alerts
export function showRealTimeAlert({ type, title, message, duration }) {
  const event = new CustomEvent('realtime-alert', {
    detail: { type, title, message, duration }
  });
  window.dispatchEvent(event);
}

// Predefined alert types
export const RealTimeAlertTypes = {
  dataUpdated: () => showRealTimeAlert({
    type: 'success',
    title: 'Data Updated',
    message: 'Dashboard data refreshed successfully',
    duration: 3000
  }),
  
  connectionLost: () => showRealTimeAlert({
    type: 'error',
    title: 'Connection Lost',
    message: 'Real-time connection interrupted. Retrying...',
    duration: 0 // Don't auto-dismiss
  }),
  
  connectionRestored: () => showRealTimeAlert({
    type: 'success',
    title: 'Connected',
    message: 'Real-time connection restored',
    duration: 3000
  }),
  
  newReport: (reportName) => showRealTimeAlert({
    type: 'info',
    title: 'New Report',
    message: `${reportName} has been added`,
    duration: 5000
  }),
  
  reportUpdated: (reportName) => showRealTimeAlert({
    type: 'info',
    title: 'Report Updated',
    message: `${reportName} has been modified`,
    duration: 4000
  }),
  
  complianceAlert: (message) => showRealTimeAlert({
    type: 'warning',
    title: 'Compliance Alert',
    message: message,
    duration: 8000
  }),
  
  criticalAlert: (message) => showRealTimeAlert({
    type: 'error',
    title: 'Critical Alert',
    message: message,
    duration: 0 // Requires manual dismissal
  })
};

export default RealTimeAlerts;


import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, Activity, Zap } from 'lucide-react';
import './RealTimeIndicator.css';

function RealTimeIndicator({ 
  isConnected = false,
  connectionType = null,
  lastUpdate = null,
  updateCount = 0,
  onRefresh = null,
  showDetails = true,
  compact = false
}) {
  const [timeAgo, setTimeAgo] = useState('');
  const [isPulsing, setIsPulsing] = useState(false);

  // Update time ago display
  useEffect(() => {
    if (!lastUpdate) {
      setTimeAgo('Never');
      return;
    }

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now - lastUpdate) / 1000);

      if (diff < 5) {
        setTimeAgo('Just now');
      } else if (diff < 60) {
        setTimeAgo(`${diff}s ago`);
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Pulse animation on update
  useEffect(() => {
    if (updateCount > 0) {
      setIsPulsing(true);
      const timeout = setTimeout(() => setIsPulsing(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [updateCount]);

  const getStatusColor = () => {
    if (!isConnected) return '#ef4444'; // red
    if (connectionType === 'websocket') return '#10b981'; // green
    if (connectionType === 'polling') return '#f59e0b'; // orange
    return '#64748b'; // gray
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (connectionType === 'websocket') return 'Live';
    if (connectionType === 'polling') return 'Polling';
    return 'Connected';
  };

  const getStatusIcon = () => {
    if (!isConnected) return WifiOff;
    if (connectionType === 'websocket') return Zap;
    if (connectionType === 'polling') return RefreshCw;
    return Wifi;
  };

  const StatusIcon = getStatusIcon();

  if (compact) {
    return (
      <div className={`realtime-indicator compact ${isPulsing ? 'pulsing' : ''}`}>
        <div 
          className="status-dot" 
          style={{ background: getStatusColor() }}
          title={`${getStatusText()} - ${timeAgo}`}
        />
      </div>
    );
  }

  return (
    <div className={`realtime-indicator ${isPulsing ? 'pulsing' : ''}`}>
      <div className="indicator-content">
        <div 
          className="status-icon" 
          style={{ color: getStatusColor() }}
        >
          <StatusIcon size={14} />
        </div>
        
        {showDetails && (
          <div className="status-details">
            <div className="status-text">{getStatusText()}</div>
            <div className="status-meta">
              <Clock size={10} />
              <span>{timeAgo}</span>
            </div>
          </div>
        )}

        {onRefresh && (
          <button 
            className="refresh-btn" 
            onClick={onRefresh}
            title="Refresh now"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>

      {showDetails && updateCount > 0 && (
        <div className="update-badge">
          {updateCount} updates
        </div>
      )}
    </div>
  );
}

export default RealTimeIndicator;

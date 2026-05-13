import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for real-time data updates
 * Supports both WebSocket streaming and polling fallback
 */
export function useRealTime(options = {}) {
  const {
    endpoint = '/api/realtime',
    pollInterval = 5000, // 5 seconds default
    enableWebSocket = true,
    enablePolling = true,
    onUpdate = null,
    onError = null,
    autoStart = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [connectionType, setConnectionType] = useState(null); // 'websocket' | 'polling' | null

  const wsRef = useRef(null);
  const pollTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${endpoint}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('[RealTime] WebSocket connected');
        setIsConnected(true);
        setConnectionType('websocket');
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
          
          if (onUpdate) {
            onUpdate(newData);
          }
        } catch (err) {
          console.error('[RealTime] Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[RealTime] WebSocket error:', err);
        setError('WebSocket connection error');
        
        if (onError) {
          onError(err);
        }
      };

      ws.onclose = () => {
        console.log('[RealTime] WebSocket disconnected');
        setIsConnected(false);
        setConnectionType(null);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          console.log(`[RealTime] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          console.log('[RealTime] Max reconnect attempts reached, falling back to polling');
          if (enablePolling) {
            startPolling();
          }
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[RealTime] Failed to create WebSocket:', err);
      setError('Failed to establish WebSocket connection');
      
      if (enablePolling) {
        startPolling();
      }
    }
  }, [endpoint, enableWebSocket, enablePolling, onUpdate, onError]);

  // Polling mechanism
  const poll = useCallback(async () => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const newData = await response.json();
      setData(newData);
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      
      if (onUpdate) {
        onUpdate(newData);
      }
      
      setError(null);
    } catch (err) {
      console.error('[RealTime] Polling error:', err);
      setError(`Polling failed: ${err.message}`);
      
      if (onError) {
        onError(err);
      }
    }
  }, [endpoint, onUpdate, onError]);

  const startPolling = useCallback(() => {
    if (!enablePolling) return;

    console.log(`[RealTime] Starting polling (interval: ${pollInterval}ms)`);
    setConnectionType('polling');
    
    // Initial poll
    poll();
    
    // Set up interval
    pollTimerRef.current = setInterval(poll, pollInterval);
  }, [enablePolling, pollInterval, poll]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
      console.log('[RealTime] Polling stopped');
    }
  }, []);

  // Start connection
  const start = useCallback(() => {
    if (enableWebSocket) {
      connectWebSocket();
    } else if (enablePolling) {
      startPolling();
    }
  }, [enableWebSocket, enablePolling, connectWebSocket, startPolling]);

  // Stop all connections
  const stop = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear polling
    stopPolling();

    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    setIsConnected(false);
    setConnectionType(null);
  }, [stopPolling]);

  // Manual refresh
  const refresh = useCallback(() => {
    if (connectionType === 'polling' || !isConnected) {
      poll();
    }
  }, [connectionType, isConnected, poll]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    isConnected,
    connectionType,
    lastUpdate,
    data,
    error,
    updateCount,
    start,
    stop,
    refresh
  };
}

/**
 * Hook for simulated real-time updates (for demo/development)
 */
export function useSimulatedRealTime(options = {}) {
  const {
    interval = 3000,
    dataGenerator = null,
    autoStart = true
  } = options;

  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  const generateData = useCallback(() => {
    if (dataGenerator) {
      return dataGenerator();
    }

    // Default data generator
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        requestsPerSecond: Math.floor(Math.random() * 100) + 50,
        responseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: (Math.random() * 2).toFixed(2)
      }
    };
  }, [dataGenerator]);

  const update = useCallback(() => {
    const newData = generateData();
    setData(newData);
    setLastUpdate(new Date());
    setUpdateCount(prev => prev + 1);
  }, [generateData]);

  const start = useCallback(() => {
    if (isActive) return;

    setIsActive(true);
    update(); // Initial update

    timerRef.current = setInterval(update, interval);
  }, [isActive, interval, update]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    data,
    lastUpdate,
    updateCount,
    isActive,
    start,
    stop,
    refresh: update
  };
}

export default useRealTime;

/**
 * DebugInfo Component
 * Temporary component to help debug rendering issues
 * Only visible in development mode
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export function DebugInfo() {
  const { user, isAuthenticated, loading } = useAuth();

  // Only show in development mode
  // @ts-ignore - import.meta.env is available in Vite
  const isDev = import.meta.env?.DEV || import.meta.env?.MODE === 'development';
  
  if (!isDev) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.85)', 
      color: 'white', 
      padding: '8px 12px',
      fontSize: '11px',
      zIndex: 1000,
      borderRadius: '6px',
      fontFamily: 'monospace',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <div style={{ marginBottom: '4px', fontWeight: 'bold', opacity: 0.9 }}>Debug Info</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? user.username : 'null'}</div>
    </div>
  );
}


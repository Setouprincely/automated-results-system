"use client";
// pages/admin/monitoring.js
import { useState, useEffect } from 'react';
import {
  Activity, Server, Database, Users, Clock,
  AlertTriangle, CheckCircle, ArrowUpCircle
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';

// Sample data - would be fetched from API in production
const initialMetrics = {
  systemStatus: 'healthy',
  uptime: '99.98%',
  responseTime: '245ms',
  activeUsers: 1243,
  databaseStatus: 'connected',
  serverLoad: 42,
  memoryUsage: 68,
  storageUsage: 39,
  activeSessions: 876,
  pendingTasks: 12
};

const serverIncidents = [
  { id: 1, type: 'warning', message: 'High CPU usage detected', timestamp: '2025-05-16T08:23:00' },
  { id: 2, type: 'error', message: 'Database connection timeout', timestamp: '2025-05-15T14:45:00', resolved: true },
  { id: 3, type: 'info', message: 'System backup completed', timestamp: '2025-05-15T02:00:00' },
  { id: 4, type: 'warning', message: 'Storage reaching 80% capacity', timestamp: '2025-05-14T22:12:00' },
];

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [incidents, setIncidents] = useState(serverIncidents);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Simulate real-time data fetching
  useEffect(() => {
    const interval = setInterval(() => {
      // In real implementation, fetch actual data from backend
      const randomVariation = () => Math.floor(Math.random() * 5) - 2;

      setMetrics(prev => ({
        ...prev,
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + randomVariation())),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + randomVariation())),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 10) - 4),
        activeSessions: Math.max(0, prev.activeSessions + Math.floor(Math.random() * 10) - 4),
        responseTime: `${Math.max(100, Math.min(500, parseInt(prev.responseTime) + randomVariation() * 10))}ms`
      }));

      setLastRefreshed(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleRefresh = () => {
    // Manually trigger refresh
    setLastRefreshed(new Date());
    // Would fetch fresh data here
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring Dashboard</h1>
        <div className="flex items-center mt-2 space-x-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
          <button
            onClick={handleRefresh}
            className="ml-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowUpCircle size={16} className="mr-1" />
            Refresh Now
          </button>
          <div className="ml-6 flex items-center">
            <span className="mr-2">Auto-refresh:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatusCard
          title="System Status"
          value={metrics.systemStatus === 'healthy' ? 'Operational' : 'Issues Detected'}
          icon={<Server className="h-6 w-6 text-green-500" />}
          status={metrics.systemStatus === 'healthy' ? 'success' : 'warning'}
        />
        <StatusCard
          title="Uptime"
          value={metrics.uptime}
          icon={<Activity className="h-6 w-6 text-blue-500" />}
          status="success"
        />
        <StatusCard
          title="Response Time"
          value={metrics.responseTime}
          icon={<Clock className="h-6 w-6 text-purple-500" />}
          status={parseInt(metrics.responseTime) < 300 ? 'success' : 'warning'}
        />
        <StatusCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          icon={<Users className="h-6 w-6 text-indigo-500" />}
          status="success"
        />
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Server Performance */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Server Performance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <MetricBar
                label="CPU Load"
                value={metrics.serverLoad}
                maxValue={100}
                unit="%"
                threshold={80}
              />
              <MetricBar
                label="Memory Usage"
                value={metrics.memoryUsage}
                maxValue={100}
                unit="%"
                threshold={85}
              />
              <MetricBar
                label="Storage Usage"
                value={metrics.storageUsage}
                maxValue={100}
                unit="%"
                threshold={90}
              />
            </div>
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">System Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">Active Sessions</span>
                </div>
                <span className="font-semibold">{metrics.activeSessions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">Database Status</span>
                </div>
                <span className="font-semibold text-green-600">{metrics.databaseStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">Pending Tasks</span>
                </div>
                <span className="font-semibold">{metrics.pendingTasks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Incidents</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIndicator type={incident.type} resolved={incident.resolved} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{incident.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(incident.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// Component for status cards
function StatusCard({ title, value, icon, status }) {
  const statusColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const valueColors = {
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  };

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <h3 className="ml-3 text-sm font-medium text-gray-700">{title}</h3>
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-2xl font-bold ${valueColors[status]}`}>{value}</p>
      </div>
    </div>
  );
}

// Component for metric bars
function MetricBar({ label, value, maxValue, unit, threshold }) {
  const percentage = (value / maxValue) * 100;

  // Determine color based on threshold
  let barColor = 'bg-green-500';
  if (percentage > threshold) {
    barColor = percentage > 95 ? 'bg-red-500' : 'bg-yellow-500';
  }

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}{unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// Component for status indicators in the incidents table
function StatusIndicator({ type, resolved }) {
  if (resolved) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <CheckCircle className="mr-1 h-3 w-3 text-gray-500" />
        Resolved
      </span>
    );
  }

  switch (type) {
    case 'error':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="mr-1 h-3 w-3 text-red-500" />
          Error
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />
          Warning
        </span>
      );
    case 'info':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="mr-1 h-3 w-3 text-blue-500" />
          Info
        </span>
      );
  }
}
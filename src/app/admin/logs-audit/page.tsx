'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Filter,
  ArrowDownUp,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  Settings,
  FileText,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import AdminLayout from "@/components/layouts/AdminLayout";

// Types definition
type LogSeverity = 'info' | 'warning' | 'error' | 'success';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  severity: LogSeverity;
  ipAddress: string;
}

export default function LogsAuditPage() {
  // State management
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'all'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock modules for filter dropdown
  const modules = [
    'all',
    'user-management',
    'registration',
    'examination',
    'grading',
    'results',
    'administration'
  ];

  // Mock data fetching - replace with actual API call
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockLogs: LogEntry[] = Array.from({ length: 50 }, (_, i) => ({
          id: `log-${i + 1}`,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          user: `user${Math.floor(Math.random() * 10) + 1}@gce-cameroon.org`,
          action: ['Login', 'View Data', 'Edit Record', 'Delete Record', 'Export Data', 'Change Settings'][Math.floor(Math.random() * 6)],
          module: modules[Math.floor(Math.random() * modules.length)],
          details: `Operation performed on system with parameters: id=${Math.floor(Math.random() * 1000)}`,
          severity: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)] as LogSeverity,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        }));

        setLogs(mockLogs);
        setFilteredLogs(mockLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on search term, date range, and severity
  useEffect(() => {
    let result = [...logs];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      result = result.filter(log => new Date(log.timestamp) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(log => new Date(log.timestamp) <= new Date(dateRange.end));
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      result = result.filter(log => log.severity === severityFilter);
    }

    // Apply module filter
    if (moduleFilter !== 'all') {
      result = result.filter(log => log.module === moduleFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key as keyof LogEntry] < b[sortConfig.key as keyof LogEntry]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof LogEntry] > b[sortConfig.key as keyof LogEntry]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredLogs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, dateRange, severityFilter, moduleFilter, sortConfig, logs]);

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Export logs to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Details', 'Severity', 'IP Address'];
    const csvData = filteredLogs.map(log => [
      log.timestamp,
      log.user,
      log.action,
      log.module,
      log.details,
      log.severity,
      log.ipAddress
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get severity icon
  const getSeverityIcon = (severity: LogSeverity) => {
    switch (severity) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
          {/* Enhanced Page header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        System Logs & Audit
                      </h1>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                          Real-time monitoring active
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
                    Monitor and audit system activities across all modules for security and compliance purposes.
                    Track user actions, system events, and security incidents in real-time.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="hidden lg:flex space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                    <div className="text-2xl font-bold">{filteredLogs.length}</div>
                    <div className="text-blue-100 text-sm">Total Logs</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                    <div className="text-2xl font-bold">{filteredLogs.filter(log => log.severity === 'success').length}</div>
                    <div className="text-green-100 text-sm">Success</div>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                    <div className="text-2xl font-bold">{filteredLogs.filter(log => log.severity === 'error').length}</div>
                    <div className="text-red-100 text-sm">Errors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters section */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-2xl blur-2xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Filters</h2>
                </div>
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export Logs
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Enhanced Search */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Logs
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users, actions, details..."
                      className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 transform focus:scale-105"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Enhanced Date range */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <input
                        type="date"
                        placeholder="Start date"
                        className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 transform focus:scale-105"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <input
                        type="date"
                        placeholder="End date"
                        className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 transform focus:scale-105"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Severity filter */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity Level
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AlertTriangle className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <select
                      className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 transform focus:scale-105 appearance-none"
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value as LogSeverity | 'all')}
                    >
                      <option value="all">All Severities</option>
                      <option value="info">🔵 Information</option>
                      <option value="warning">🟡 Warning</option>
                      <option value="error">🔴 Error</option>
                      <option value="success">🟢 Success</option>
                    </select>
                  </div>
                </div>

                {/* Enhanced Module filter */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Module
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <select
                      className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 transform focus:scale-105 appearance-none"
                      value={moduleFilter}
                      onChange={(e) => setModuleFilter(e.target.value)}
                    >
                      <option value="all">All Modules</option>
                      <option value="user-management">👥 User Management</option>
                      <option value="registration">📝 Registration</option>
                      <option value="examination">📋 Examination</option>
                      <option value="grading">📊 Grading</option>
                      <option value="results">🏆 Results</option>
                      <option value="administration">⚙️ Administration</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Logs table */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/5 to-blue-600/5 rounded-2xl blur-2xl"></div>
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {isLoading ? (
                <div className="py-20 text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                    <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 mx-auto animate-ping"></div>
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg font-medium">Loading audit logs...</p>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Fetching system activity data</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No logs found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or date range.</p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Audit Trail</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Showing {currentItems.length} of {filteredLogs.length} log entries
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Last updated: {new Date().toLocaleTimeString()}
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            <button
                              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group focus:outline-none"
                              onClick={() => handleSort('timestamp')}
                            >
                              <Clock className="h-4 w-4 group-hover:animate-pulse" />
                              <span>Timestamp</span>
                              <ArrowDownUp className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </button>
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            <button
                              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group focus:outline-none"
                              onClick={() => handleSort('user')}
                            >
                              <User className="h-4 w-4 group-hover:animate-pulse" />
                              <span>User</span>
                              <ArrowDownUp className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </button>
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            <button
                              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group focus:outline-none"
                              onClick={() => handleSort('action')}
                            >
                              <Activity className="h-4 w-4 group-hover:animate-pulse" />
                              <span>Action</span>
                              <ArrowDownUp className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </button>
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            <button
                              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group focus:outline-none"
                              onClick={() => handleSort('module')}
                            >
                              <Settings className="h-4 w-4 group-hover:animate-pulse" />
                              <span>Module</span>
                              <ArrowDownUp className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </button>
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>Details</span>
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            <button
                              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group focus:outline-none"
                              onClick={() => handleSort('severity')}
                            >
                              <AlertTriangle className="h-4 w-4 group-hover:animate-pulse" />
                              <span>Severity</span>
                              <ArrowDownUp className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </button>
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4" />
                              <span>IP Address</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {currentItems.map((log, index) => (
                          <tr
                            key={log.id}
                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{formatDate(log.timestamp)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {log.user.charAt(0).toUpperCase()}
                                </div>
                                <span>{log.user}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              <div className="flex items-center space-x-2">
                                <Activity className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{log.action}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                  <Settings className="h-3 w-3 text-gray-500" />
                                </div>
                                <span className="font-medium capitalize">{log.module.replace('-', ' ')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                              <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="group relative">
                                  <p className="truncate group-hover:whitespace-normal group-hover:break-words transition-all duration-200">
                                    {log.details}
                                  </p>
                                  {log.details.length > 50 && (
                                    <div className="absolute left-0 top-full mt-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 max-w-sm whitespace-normal">
                                      {log.details}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-full ${
                                  log.severity === 'error' ? 'bg-red-100 dark:bg-red-900' :
                                  log.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                                  log.severity === 'success' ? 'bg-green-100 dark:bg-green-900' :
                                  'bg-blue-100 dark:bg-blue-900'
                                }`}>
                                  {getSeverityIcon(log.severity)}
                                </div>
                                <span className={`text-sm font-semibold capitalize ${
                                  log.severity === 'error' ? 'text-red-600 dark:text-red-400' :
                                  log.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                                  log.severity === 'success' ? 'text-green-600 dark:text-green-400' :
                                  'text-blue-600 dark:text-blue-400'
                                }`}>
                                  {log.severity}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                  {log.ipAddress}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                </table>
              </div>

                  {/* Enhanced Pagination */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                    {/* Mobile pagination */}
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                          currentPage === 1
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600 dark:hover:to-gray-500 shadow-md hover:shadow-lg'
                        }`}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                      </button>
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastItem >= filteredLogs.length}
                        className={`ml-3 relative inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                          indexOfLastItem >= filteredLogs.length
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600 dark:hover:to-gray-500 shadow-md hover:shadow-lg'
                        }`}
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>

                    {/* Desktop pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              Showing <span className="text-blue-600 dark:text-blue-400">{indexOfFirstItem + 1}</span> to{' '}
                              <span className="text-blue-600 dark:text-blue-400">
                                {Math.min(indexOfLastItem, filteredLogs.length)}
                              </span>{' '}
                              of <span className="text-blue-600 dark:text-blue-400">{filteredLogs.length}</span> results
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Page {currentPage} of {Math.ceil(filteredLogs.length / itemsPerPage)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-xl shadow-lg -space-x-px bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600" aria-label="Pagination">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-3 rounded-l-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                              currentPage === 1
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {/* Enhanced Page numbers */}
                          {Array.from({ length: Math.ceil(filteredLogs.length / itemsPerPage) }).map((_, index) => {
                            // Show only 5 page numbers around current page
                            if (
                              index === 0 ||
                              index === Math.ceil(filteredLogs.length / itemsPerPage) - 1 ||
                              (index >= currentPage - 2 && index <= currentPage + 2)
                            ) {
                              return (
                                <button
                                  key={index}
                                  onClick={() => paginate(index + 1)}
                                  className={`relative inline-flex items-center px-4 py-3 border text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                                    currentPage === index + 1
                                      ? 'z-10 bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
                                  }`}
                                >
                                  {index + 1}
                                </button>
                              );
                            }
                            // Show ellipsis for skipped pages
                            if (
                              (index === 1 && currentPage > 4) ||
                              (index === Math.ceil(filteredLogs.length / itemsPerPage) - 2 && currentPage < Math.ceil(filteredLogs.length / itemsPerPage) - 4)
                            ) {
                              return (
                                <span
                                  key={index}
                                  className="relative inline-flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}

                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={indexOfLastItem >= filteredLogs.length}
                            className={`relative inline-flex items-center px-4 py-3 rounded-r-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                              indexOfLastItem >= filteredLogs.length
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

/**
 * This file should be placed in app/admin/log-audit/page.tsx in your Next.js project.
 */
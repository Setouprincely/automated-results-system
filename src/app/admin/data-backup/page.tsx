// src/app/admin/data-backup/page.tsx
"use client";
import { useState, useEffect } from 'react';
import {
  Save, Database, DownloadCloud, UploadCloud,
  RefreshCw, CheckCircle, AlertCircle, Calendar
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';

// Define interfaces for type safety
interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
  type: string;
  status: string;
}

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

export default function DataBackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'examination' | 'configuration'>('full');

  useEffect(() => {
    // Fetch backup history from API
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    // Mock data - would be replaced with actual API call
    setTimeout(() => {
      setBackups([
        { id: 1, name: 'Full Backup', date: '2025-05-15 09:30', size: '2.3GB', type: 'automated', status: 'completed' },
        { id: 2, name: 'Incremental Backup', date: '2025-05-14 09:30', size: '450MB', type: 'automated', status: 'completed' },
        { id: 3, name: 'Manual Backup', date: '2025-05-10 14:45', size: '2.2GB', type: 'manual', status: 'completed' },
        { id: 4, name: 'Pre-Examination Backup', date: '2025-05-05 08:00', size: '2.1GB', type: 'manual', status: 'completed' },
        { id: 5, name: 'Monthly Backup', date: '2025-04-30 23:00', size: '2.0GB', type: 'scheduled', status: 'completed' }
      ]);
      setLoading(false);
    }, 800);
  };

  const createBackup = async () => {
    setMessage({ type: 'info', text: 'Creating backup...' });
    setBackupProgress(0);

    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setMessage({ type: 'success', text: 'Backup created successfully!' });
          fetchBackups();
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    setMessage({ type: 'info', text: `Restoring backup from ${selectedBackup.date}...` });
    setRestoreProgress(0);

    // Simulate restore process
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setMessage({ type: 'success', text: 'System restored successfully!' });
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  const downloadBackup = (backup: Backup) => {
    setMessage({ type: 'info', text: `Preparing ${backup.name} for download...` });

    // Simulate download preparation
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Backup downloaded successfully!' });
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="px-6 py-8 bg-gray-100 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Data Backup & Restore</h1>
          <p className="text-gray-600 mt-2">Manage system backups and recovery operations</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> :
             message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> :
             <RefreshCw className="w-5 h-5 mr-2 animate-spin" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Backup Options */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Save className="w-5 h-5 mr-2 text-blue-600" />
              Create Backup
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Type</label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={backupType}
                onChange={(e) => setBackupType(e.target.value as 'full' | 'incremental' | 'examination' | 'configuration')}
              >
                <option value="full">Full Backup</option>
                <option value="incremental">Incremental Backup</option>
                <option value="examination">Examination Data Only</option>
                <option value="configuration">System Configuration Only</option>
              </select>
            </div>

            {backupProgress > 0 && backupProgress < 100 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${backupProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1 text-right">{backupProgress}%</p>
              </div>
            )}

            <button
              onClick={createBackup}
              disabled={backupProgress > 0 && backupProgress < 100}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-2" />
              Start Backup
            </button>
          </div>

          {/* Restore Options */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-indigo-600" />
              Restore System
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Backup to Restore</label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedBackup?.id || ''}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setSelectedBackup(null);
                    return;
                  }
                  const id = parseInt(e.target.value);
                  const backup = backups.find(b => b.id === id);
                  if (backup) {
                    setSelectedBackup(backup);
                  }
                }}
              >
                <option value="">Select a backup</option>
                {backups.map(backup => (
                  <option key={backup.id} value={backup.id}>
                    {backup.name} - {backup.date} ({backup.size})
                  </option>
                ))}
              </select>
            </div>

            {restoreProgress > 0 && restoreProgress < 100 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${restoreProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1 text-right">{restoreProgress}%</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={restoreBackup}
                disabled={!selectedBackup || (restoreProgress > 0 && restoreProgress < 100)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Restore System
              </button>

              <button
                onClick={() => selectedBackup && downloadBackup(selectedBackup)}
                disabled={!selectedBackup}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4 mr-2" />
                Download Backup
              </button>
            </div>
          </div>

          {/* Backup History */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Backup History
              </h2>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>Loading backup history...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{backup.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                              backup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => downloadBackup(backup)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBackup(backup);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
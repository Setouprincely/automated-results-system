'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Filter,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  User
} from 'lucide-react';

type Incident = {
  id: string;
  date: string;
  time: string;
  centerName: string;
  examTitle: string;
  reportedBy: string;
  incidentType: string;
  status: 'pending' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
};

const mockIncidents: Incident[] = [
  {
    id: 'INC-2025-001',
    date: '2025-05-15',
    time: '10:23 AM',
    centerName: 'Government High School Buea',
    examTitle: 'O Level Mathematics Paper 1',
    reportedBy: 'John Nkeng',
    incidentType: 'Suspected Malpractice',
    status: 'investigating',
    severity: 'high',
    description: 'Candidate found with unauthorized materials during examination. Materials confiscated and statement taken.'
  },
  {
    id: 'INC-2025-002',
    date: '2025-05-15',
    time: '11:05 AM',
    centerName: 'Bamenda Catholic College',
    examTitle: 'A Level Chemistry Practical',
    reportedBy: 'Marie Foncha',
    incidentType: 'Technical Issue',
    status: 'resolved',
    severity: 'medium',
    description: 'Power outage during practical examination. Backup generator activated after 3 minutes. Additional time was provided to candidates.'
  },
  {
    id: 'INC-2025-003',
    date: '2025-05-14',
    time: '09:15 AM',
    centerName: 'Lycée de Douala',
    examTitle: 'O Level French Paper 2',
    reportedBy: 'Pierre Mbarga',
    incidentType: 'Missing Materials',
    status: 'pending',
    severity: 'critical',
    description: 'Examination center received insufficient question papers. Emergency photocopying arranged. Examination delayed by 25 minutes.'
  }
];

const incidentTypes = [
  'Suspected Malpractice',
  'Technical Issue',
  'Medical Emergency',
  'Missing Materials',
  'Disturbance',
  'Late Arrival',
  'Script Issue',
  'Invigilator Issue',
  'Other'
];

const ExaminationIncidentReportingPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'pending',
    severity: 'medium'
  });

  // Filter incidents based on search term and status
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch =
      incident.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = `INC-2025-${String(incidents.length + 1).padStart(3, '0')}`;

    const incidentToAdd: Incident = {
      ...newIncident as Incident,
      id: newId
    };

    setIncidents([incidentToAdd, ...incidents]);
    setIsModalOpen(false);
    setNewIncident({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      severity: 'medium'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Examination Incident Reporting</h1>
            <p className="text-gray-600">Manage and track examination incidents</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Report New Incident
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search incidents by center, exam, reporter, or ID..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center & Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{incident.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(incident.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {incident.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin size={14} />
                            {incident.centerName}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <FileText size={14} />
                            {incident.examTitle}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.incidentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No incidents found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incident Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-500" />
            Incident Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-blue-700 text-sm font-medium">Total Incidents</h3>
              <p className="text-2xl font-bold">{incidents.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-yellow-700 text-sm font-medium">Pending</h3>
              <p className="text-2xl font-bold">{incidents.filter(i => i.status === 'pending').length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-purple-700 text-sm font-medium">Investigating</h3>
              <p className="text-2xl font-bold">{incidents.filter(i => i.status === 'investigating').length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-green-700 text-sm font-medium">Resolved</h3>
              <p className="text-2xl font-bold">{incidents.filter(i => i.status === 'resolved').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for creating new incident */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Report New Examination Incident</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitIncident}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newIncident.date}
                    onChange={(e) => setNewIncident({...newIncident, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newIncident.time?.toString().substring(0, 5)}
                    onChange={(e) => setNewIncident({...newIncident, time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examination Center</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter examination center name"
                    value={newIncident.centerName || ''}
                    onChange={(e) => setNewIncident({...newIncident, centerName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examination Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter examination title"
                    value={newIncident.examTitle || ''}
                    onChange={(e) => setNewIncident({...newIncident, examTitle: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter your name"
                    value={newIncident.reportedBy || ''}
                    onChange={(e) => setNewIncident({...newIncident, reportedBy: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newIncident.incidentType || ''}
                    onChange={(e) => setNewIncident({...newIncident, incidentType: e.target.value})}
                    required
                  >
                    <option value="">Select incident type</option>
                    {incidentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({...newIncident, severity: e.target.value as any})}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newIncident.status}
                    onChange={(e) => setNewIncident({...newIncident, status: e.target.value as any})}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                  placeholder="Provide detailed description of the incident..."
                  value={newIncident.description || ''}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ExaminationIncidentReportingPage;
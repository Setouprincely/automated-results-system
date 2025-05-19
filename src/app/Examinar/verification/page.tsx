'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Filter, 
  Search, 
  Download,
  FileCheck,
  UserCheck,
  Check,
  X
} from 'lucide-react';
import Head from 'next/head';

// Types for our verification workflow
type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'rejected';

interface VerificationTask {
  id: string;
  examType: 'O Level' | 'A Level';
  subject: string;
  center: string;
  candidateCount: number;
  assignedTo: string;
  status: VerificationStatus;
  priority: 'high' | 'medium' | 'low';
  lastUpdated: string;
  progress: number;
}

// Mock data for demonstration
const mockVerificationTasks: VerificationTask[] = [
  {
    id: 'VT-001',
    examType: 'O Level',
    subject: 'Mathematics',
    center: 'Bamenda Examination Center',
    candidateCount: 145,
    assignedTo: 'Dr. Nkeng Paul',
    status: 'in_progress',
    priority: 'high',
    lastUpdated: '2025-05-17T14:23:00',
    progress: 65
  },
  {
    id: 'VT-002',
    examType: 'A Level',
    subject: 'Physics',
    center: 'Douala Central Examination Hub',
    candidateCount: 87,
    assignedTo: 'Prof. Marie Tchamba',
    status: 'pending',
    priority: 'medium',
    lastUpdated: '2025-05-16T09:45:00',
    progress: 0
  },
  {
    id: 'VT-003',
    examType: 'O Level',
    subject: 'English Language',
    center: 'Yaoundé National Center',
    candidateCount: 210,
    assignedTo: 'Mr. Joseph Ekane',
    status: 'verified',
    priority: 'high',
    lastUpdated: '2025-05-15T16:30:00',
    progress: 100
  },
  {
    id: 'VT-004',
    examType: 'A Level',
    subject: 'Chemistry',
    center: 'Limbe Examination Center',
    candidateCount: 62,
    assignedTo: 'Dr. Ngono Alice',
    status: 'rejected',
    priority: 'medium',
    lastUpdated: '2025-05-17T11:15:00',
    progress: 78
  },
  {
    id: 'VT-005',
    examType: 'O Level',
    subject: 'Geography',
    center: 'Buea Regional Center',
    candidateCount: 175,
    assignedTo: 'Mrs. Foko Sarah',
    status: 'in_progress',
    priority: 'low',
    lastUpdated: '2025-05-17T12:05:00',
    progress: 32
  },
  {
    id: 'VT-006',
    examType: 'A Level',
    subject: 'French',
    center: 'Maroua North Center',
    candidateCount: 94,
    assignedTo: 'Dr. Pierre Mbarga',
    status: 'in_progress',
    priority: 'high',
    lastUpdated: '2025-05-16T14:20:00',
    progress: 45
  }
];

const VerificationWorkflowPage = () => {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<VerificationTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating data fetch
  useEffect(() => {
    const fetchTasks = async () => {
      // In a real app, you would fetch from an API
      setTimeout(() => {
        setTasks(mockVerificationTasks);
        setFilteredTasks(mockVerificationTasks);
        setIsLoading(false);
      }, 800);
    };

    fetchTasks();
  }, []);

  // Filter tasks based on search query and status filter
  useEffect(() => {
    let result = tasks;
    
    if (searchQuery) {
      result = result.filter(task => 
        task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.center.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(result);
  }, [searchQuery, statusFilter, tasks]);

  const getStatusIcon = (status: VerificationStatus) => {
    switch(status) {
      case 'pending': 
        return <Clock className="text-yellow-500" />;
      case 'in_progress': 
        return <ArrowRight className="text-blue-500" />;
      case 'verified': 
        return <CheckCircle className="text-green-500" />;
      case 'rejected': 
        return <AlertCircle className="text-red-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleTaskSelection = (task: VerificationTask) => {
    setSelectedTask(task);
  };

  const handleResetSelection = () => {
    setSelectedTask(null);
  };

  const handleUpdateStatus = (newStatus: VerificationStatus) => {
    if (!selectedTask) return;
    
    // In a real app, you would call an API to update the status
    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        const updatedTask = {
          ...task,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          progress: newStatus === 'verified' ? 100 : task.progress
        };
        setSelectedTask(updatedTask);
        return updatedTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
  };

  const getStatusBadgeClass = (status: VerificationStatus) => {
    switch(status) {
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': 
        return 'bg-blue-100 text-blue-800';
      case 'verified': 
        return 'bg-green-100 text-green-800';
      case 'rejected': 
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Verification Workflow | GCE Automated System</title>
      </Head>
      
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Examination Verification Workflow</h1>
          
          <div className="flex space-x-3">
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileCheck className="h-5 w-5 mr-2" />
              Assign Verification Tasks
            </button>
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by ID, subject, center or examiner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative inline-flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | 'all')}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      onClick={() => handleTaskSelection(task)}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedTask?.id === task.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.examType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.center}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              task.status === 'verified' ? 'bg-green-500' :
                              task.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                            }`} 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{task.progress}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(task.lastUpdated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskSelection(task);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No verification tasks match your search criteria.</p>
            </div>
          )}
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Task Details - {selectedTask.id}
              </h2>
              <button 
                onClick={handleResetSelection}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
                  <div className="mt-3 border rounded-md divide-y">
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Subject</span>
                      <span className="text-sm text-gray-900">{selectedTask.subject}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Examination Type</span>
                      <span className="text-sm text-gray-900">{selectedTask.examType}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Examination Center</span>
                      <span className="text-sm text-gray-900">{selectedTask.center}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Candidate Count</span>
                      <span className="text-sm text-gray-900">{selectedTask.candidateCount}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
                  <div className="mt-3 border rounded-md divide-y">
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Assigned To</span>
                      <span className="text-sm text-gray-900">{selectedTask.assignedTo}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Current Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedTask.status)}`}>
                        {getStatusIcon(selectedTask.status)}
                        <span className="ml-1 capitalize">{selectedTask.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Priority</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                        selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        <span className="capitalize">{selectedTask.priority}</span>
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Last Updated</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedTask.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Verification Progress</h3>
                <div className="mt-2">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {selectedTask.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div 
                        style={{ width: `${selectedTask.progress}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          selectedTask.status === 'verified' ? 'bg-green-500' :
                          selectedTask.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Actions</h3>
                <div className="mt-3 flex justify-between flex-wrap gap-3">
                  <div className="space-x-3">
                    <button 
                      onClick={() => handleUpdateStatus('verified')}
                      disabled={selectedTask.status === 'verified'}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        selectedTask.status === 'verified'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                      }`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Verified
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('rejected')}
                      disabled={selectedTask.status === 'rejected'}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        selectedTask.status === 'rejected'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                      }`}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Mark as Rejected
                    </button>
                  </div>
                  
                  <div>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Reassign Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            Showing {filteredTasks.length} of {tasks.length} verification tasks
          </div>
          
          <div className="flex-1 flex justify-between sm:justify-end">
            <button 
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationWorkflowPage;
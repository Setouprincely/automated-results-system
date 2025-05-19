'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  BarChart2,
  Eye
} from 'lucide-react';

// Define types
type ResultStatus = 'pending' | 'approved' | 'rejected';

interface ExamResult {
  id: number;
  level: 'O Level' | 'A Level';
  subject: string;
  center: string;
  candidatesCount: number;
  averageScore: number;
  passRate: number;
  status: ResultStatus;
  lastUpdated: string;
}

interface FilterOptions {
  level: string;
  subject: string;
  center: string;
  status: ResultStatus | 'all';
}

interface AlertMessage {
  type: 'success' | 'error';
  message: string;
}

export default function ResultsApproval() {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExamResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<number[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    level: 'all', // 'O Level' or 'A Level'
    subject: 'all',
    center: 'all',
    status: 'pending' // 'pending', 'approved', 'rejected'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<ResultStatus>('pending');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<ResultStatus>('pending');
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const mockResults: ExamResult[] = [
        {
          id: 1,
          level: 'O Level',
          subject: 'Mathematics',
          center: 'Buea Examination Center',
          candidatesCount: 156,
          averageScore: 62.4,
          passRate: 78.2,
          status: 'pending',
          lastUpdated: '2025-05-15T10:30:00'
        },
        {
          id: 2,
          level: 'O Level',
          subject: 'English Language',
          center: 'Douala Central Center',
          candidatesCount: 203,
          averageScore: 68.7,
          passRate: 82.5,
          status: 'pending',
          lastUpdated: '2025-05-15T09:45:00'
        },
        {
          id: 3,
          level: 'A Level',
          subject: 'Physics',
          center: 'Yaounde Technical Center',
          candidatesCount: 98,
          averageScore: 59.2,
          passRate: 75.3,
          status: 'pending',
          lastUpdated: '2025-05-14T16:20:00'
        },
        {
          id: 4,
          level: 'A Level',
          subject: 'Chemistry',
          center: 'Limbe Science Academy',
          candidatesCount: 87,
          averageScore: 61.8,
          passRate: 79.4,
          status: 'approved',
          lastUpdated: '2025-05-13T14:10:00'
        },
        {
          id: 5,
          level: 'O Level',
          subject: 'Biology',
          center: 'Bamenda Main Center',
          candidatesCount: 145,
          averageScore: 58.3,
          passRate: 72.6,
          status: 'rejected',
          lastUpdated: '2025-05-12T11:25:00'
        }
      ];

      setResults(mockResults);
      filterResults(mockResults, filterOptions, searchQuery, currentTab);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filterResults = (
    resultsData: ExamResult[],
    options: FilterOptions,
    query: string,
    tab: ResultStatus
  ) => {
    let filtered = [...resultsData];

    // Apply status filter based on tab
    filtered = filtered.filter(result => result.status === tab);

    // Apply other filters
    if (options.level !== 'all') {
      filtered = filtered.filter(result => result.level === options.level);
    }

    if (options.subject !== 'all') {
      filtered = filtered.filter(result => result.subject === options.subject);
    }

    if (options.center !== 'all') {
      filtered = filtered.filter(result => result.center === options.center);
    }

    // Apply search query
    if (query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(result =>
        result.subject.toLowerCase().includes(lowercaseQuery) ||
        result.center.toLowerCase().includes(lowercaseQuery)
      );
    }

    setFilteredResults(filtered);
  };

  useEffect(() => {
    filterResults(results, filterOptions, searchQuery, currentTab);
  }, [filterOptions, searchQuery, currentTab, results]);

  const handleTabChange = (tab: ResultStatus) => {
    setCurrentTab(tab);
    setSelectedResults([]);
  };

  const handleSelectResult = (id: number) => {
    if (selectedResults.includes(id)) {
      setSelectedResults(selectedResults.filter(resultId => resultId !== id));
    } else {
      setSelectedResults([...selectedResults, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedResults.length === filteredResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(filteredResults.map(result => result.id));
    }
  };

  const handleActionConfirmation = (action: ResultStatus) => {
    setConfirmationAction(action);
    setShowConfirmation(true);
  };

  const processAction = () => {
    setShowConfirmation(false);

    // Update the status of selected results
    const updatedResults = results.map(result => {
      if (selectedResults.includes(result.id)) {
        return { ...result, status: confirmationAction };
      }
      return result;
    });

    setResults(updatedResults);
    setSelectedResults([]);

    // Show success message
    const actionText = confirmationAction === 'approved' ? 'approved' : 'rejected';
    setAlertMessage({
      type: 'success',
      message: `${selectedResults.length} result set(s) have been ${actionText} successfully.`
    });

    // Clear alert after 5 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Results Approval</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve examination results before publication
          </p>
        </div>

        {alertMessage && (
          <div className={`p-4 mb-4 rounded-md border ${
            alertMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {alertMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <p>{alertMessage.message}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10 py-2 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Search by subject or center"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex-shrink-0">
                <div className="relative inline-block text-left">
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        // Example of using setFilterOptions
                        setFilterOptions({
                          ...filterOptions,
                          level: filterOptions.level === 'all' ? 'O Level' : 'all'
                        });
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                className="text-sm px-3 py-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                className="text-sm px-3 py-1"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Statistics
              </Button>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <Tabs defaultValue="pending" value={currentTab} onValueChange={(value) => handleTabChange(value as ResultStatus)}>
              <TabsList className="mb-2">
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                    {results.filter(r => r.status === 'pending').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                    {results.filter(r => r.status === 'approved').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected
                  <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                    {results.filter(r => r.status === 'rejected').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-500">Loading results...</span>
            </div>
          ) : (
            <>
              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 mb-2">
                    <AlertTriangle className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                        onChange={handleSelectAll}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {selectedResults.length} of {filteredResults.length} selected
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {currentTab === 'pending' && selectedResults.length > 0 && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                            onClick={() => handleActionConfirmation('approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve Selected
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                            onClick={() => handleActionConfirmation('rejected')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Reject Selected
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="sr-only">Select</span>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Level
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Examination Center
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidates
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Average Score
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pass Rate
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredResults.map((result) => (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  checked={selectedResults.includes(result.id)}
                                  onChange={() => handleSelectResult(result.id)}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {result.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{result.subject}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{result.center}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.candidatesCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{result.averageScore}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{result.passRate}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(result.lastUpdated)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800 mr-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              {currentTab === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-800 mr-2"
                                    onClick={() => {
                                      setSelectedResults([result.id]);
                                      handleActionConfirmation('approved');
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">Approve</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => {
                                      setSelectedResults([result.id]);
                                      handleActionConfirmation('rejected');
                                    }}
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="sr-only">Reject</span>
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredResults.length}</span> results
              </div>
              <div className="flex-1 flex justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100"
                  >
                    2
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    3
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                      confirmationAction === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    } sm:mx-0 sm:h-10 sm:w-10`}>
                      {confirmationAction === 'approved' ? (
                        <CheckCircle className={`h-6 w-6 text-green-600`} />
                      ) : (
                        <AlertTriangle className={`h-6 w-6 text-red-600`} />
                      )}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {confirmationAction === 'approved' ? 'Approve Results' : 'Reject Results'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to {confirmationAction === 'approved' ? 'approve' : 'reject'} the selected {selectedResults.length} result set(s)?
                          {confirmationAction === 'approved'
                            ? ' This will release them for publication.'
                            : ' Rejected results will need to be reviewed again before they can be published.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                      confirmationAction === 'approved'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                    onClick={processAction}
                  >
                    {confirmationAction === 'approved' ? 'Approve' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
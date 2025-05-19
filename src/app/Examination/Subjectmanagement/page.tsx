'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layouts/layout';
import { Plus, Search, Edit, Trash2, AlertTriangle, FileText, Filter } from 'lucide-react';
import Link from 'next/link';

// Types
interface Subject {
  id: string;
  code: string;
  name: string;
  level: 'O Level' | 'A Level';
  department: string;
  hasActiveSyllabus: boolean;
  lastUpdated: string;
  status: 'Active' | 'Inactive' | 'Pending Review';
}

export default function SubjectManagement() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Dummy departments data
  const departments = [
    'Sciences',
    'Mathematics',
    'Languages',
    'Arts & Humanities',
    'Social Sciences',
    'Technical & Vocational'
  ];

  // Fetch subjects data
  useEffect(() => {
    // This would be an API call in a real application
    const mockSubjects: Subject[] = [
      {
        id: '1',
        code: 'ENG-O',
        name: 'English Language',
        level: 'O Level',
        department: 'Languages',
        hasActiveSyllabus: true,
        lastUpdated: '2025-03-15',
        status: 'Active'
      },
      {
        id: '2',
        code: 'MATH-O',
        name: 'Mathematics',
        level: 'O Level',
        department: 'Mathematics',
        hasActiveSyllabus: true,
        lastUpdated: '2025-02-20',
        status: 'Active'
      },
      {
        id: '3',
        code: 'FREN-O',
        name: 'French',
        level: 'O Level',
        department: 'Languages',
        hasActiveSyllabus: true,
        lastUpdated: '2025-01-10',
        status: 'Active'
      },
      {
        id: '4',
        code: 'BIOL-O',
        name: 'Biology',
        level: 'O Level',
        department: 'Sciences',
        hasActiveSyllabus: true,
        lastUpdated: '2025-04-02',
        status: 'Active'
      },
      {
        id: '5',
        code: 'PHYS-O',
        name: 'Physics',
        level: 'O Level',
        department: 'Sciences',
        hasActiveSyllabus: false,
        lastUpdated: '2024-12-05',
        status: 'Pending Review'
      },
      {
        id: '6',
        code: 'CHEM-O',
        name: 'Chemistry',
        level: 'O Level',
        department: 'Sciences',
        hasActiveSyllabus: true,
        lastUpdated: '2025-03-18',
        status: 'Active'
      },
      {
        id: '7',
        code: 'HIST-O',
        name: 'History',
        level: 'O Level',
        department: 'Arts & Humanities',
        hasActiveSyllabus: true,
        lastUpdated: '2025-02-25',
        status: 'Active'
      },
      {
        id: '8',
        code: 'LIT-A',
        name: 'Literature in English',
        level: 'A Level',
        department: 'Arts & Humanities',
        hasActiveSyllabus: true,
        lastUpdated: '2025-01-30',
        status: 'Active'
      },
      {
        id: '9',
        code: 'MATH-A',
        name: 'Further Mathematics',
        level: 'A Level',
        department: 'Mathematics',
        hasActiveSyllabus: false,
        lastUpdated: '2024-11-20',
        status: 'Inactive'
      },
      {
        id: '10',
        code: 'PHYS-A',
        name: 'Physics',
        level: 'A Level',
        department: 'Sciences',
        hasActiveSyllabus: true,
        lastUpdated: '2025-03-05',
        status: 'Active'
      },
      {
        id: '11',
        code: 'COMP-A',
        name: 'Computer Science',
        level: 'A Level',
        department: 'Technical & Vocational',
        hasActiveSyllabus: true,
        lastUpdated: '2025-04-12',
        status: 'Active'
      },
      {
        id: '12',
        code: 'ECON-A',
        name: 'Economics',
        level: 'A Level',
        department: 'Social Sciences',
        hasActiveSyllabus: true,
        lastUpdated: '2025-02-18',
        status: 'Active'
      }
    ];

    setTimeout(() => {
      setSubjects(mockSubjects);
      setLoading(false);
    }, 800);
  }, []);

  // Filter subjects based on search term and filters
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = filterLevel === 'All' || subject.level === filterLevel;
    const matchesDepartment = filterDepartment === 'All' || subject.department === filterDepartment;
    const matchesStatus = filterStatus === 'All' || subject.status === filterStatus;

    return matchesSearch && matchesLevel && matchesDepartment && matchesStatus;
  });

  // Handle subject selection
  const toggleSubjectSelection = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id)
        ? prev.filter(subjectId => subjectId !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedSubjects.length === filteredSubjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(filteredSubjects.map(subject => subject.id));
    }
  };

  // Status badge color mapping
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage examination subjects and their associated syllabuses
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/Examination/Subjectmanagement/new"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add Subject
            </Link>
            <Link
              href="/Examination/Syllabuses"
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FileText size={16} />
              Manage Syllabuses
            </Link>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search subjects by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <Filter size={16} />
              Filters
              {(filterLevel !== 'All' || filterDepartment !== 'All' || filterStatus !== 'All') && (
                <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                  {(filterLevel !== 'All' ? 1 : 0) +
                   (filterDepartment !== 'All' ? 1 : 0) +
                   (filterStatus !== 'All' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="All">All Levels</option>
                  <option value="O Level">O Level</option>
                  <option value="A Level">A Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bulk actions */}
        {selectedSubjects.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">
                {selectedSubjects.length} {selectedSubjects.length === 1 ? 'subject' : 'subjects'} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50"
                onClick={() => setSelectedSubjects([])}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
              >
                Bulk Actions
              </button>
            </div>
          </div>
        )}

        {/* Subjects table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-200 mb-3"></div>
                <div className="h-4 w-36 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
              </div>
            </div>
          ) : (
            <>
              {filteredSubjects.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                    <AlertTriangle size={24} className="text-gray-400" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterLevel !== 'All' || filterDepartment !== 'All' || filterStatus !== 'All' ?
                      'Try adjusting your search or filters to find what you\'re looking for.' :
                      'Get started by adding a new subject.'}
                  </p>
                  {!searchTerm && filterLevel === 'All' && filterDepartment === 'All' && filterStatus === 'All' && (
                    <div className="mt-4">
                      <Link
                        href="/Examination/Subjectmanagement/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus size={16} className="-ml-1 mr-2" />
                        Add Subject
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={selectedSubjects.length === filteredSubjects.length && filteredSubjects.length > 0}
                              onChange={toggleSelectAll}
                            />
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Syllabus
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={selectedSubjects.includes(subject.id)}
                                onChange={() => toggleSubjectSelection(subject.id)}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{subject.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{subject.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{subject.level}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{subject.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {subject.hasActiveSyllabus ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{subject.lastUpdated}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(subject.status)}`}>
                              {subject.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => router.push(`/Examination/Subjectmanagement/${subject.id}`)}
                              >
                                <Edit size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {filteredSubjects.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredSubjects.length}</span> of{' '}
                        <span className="font-medium">{filteredSubjects.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <a
                          href="#"
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                        <a
                          href="#"
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          1
                        </a>
                        <a
                          href="#"
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Subjects</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{subjects.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <FileText size={24} className="text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Subjects</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {subjects.filter(s => s.status === 'Active').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <AlertTriangle size={24} className="text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {subjects.filter(s => s.status === 'Pending Review').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Missing Syllabuses</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {subjects.filter(s => !s.hasActiveSyllabus).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
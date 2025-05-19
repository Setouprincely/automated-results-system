'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layouts/layout';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  Layers,
  Plus,
  Save,
  Settings,
  Users
} from 'lucide-react';

// Define types
type ExamLevel = 'O Level' | 'A Level';
type ExamSession = 'June' | 'November';
type ExamYear = string;
type SubjectType = {
  id: string;
  name: string;
  code: string;
  level: ExamLevel;
  papers: PaperType[];
};

type PaperType = {
  id: string;
  name: string;
  duration: number; // in minutes
  totalMarks: number;
  passMark: number;
};

const ExaminationSetupPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'subjects' | 'grading' | 'centers'>('general');
  const [examLevel, setExamLevel] = useState<ExamLevel>('O Level');
  const [session, setSession] = useState<ExamSession>('June');
  const [year, setYear] = useState<ExamYear>(new Date().getFullYear().toString());
  const [registrationDeadline, setRegistrationDeadline] = useState<string>('');
  const [examStartDate, setExamStartDate] = useState<string>('');
  const [examEndDate, setExamEndDate] = useState<string>('');
  const [resultsReleaseDate, setResultsReleaseDate] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sample subjects data
  const [subjects, setSubjects] = useState<SubjectType[]>([
    {
      id: '1',
      name: 'Mathematics',
      code: 'MATH',
      level: 'O Level',
      papers: [
        { id: '1-1', name: 'Paper 1 (Multiple Choice)', duration: 90, totalMarks: 40, passMark: 15 },
        { id: '1-2', name: 'Paper 2 (Long Questions)', duration: 150, totalMarks: 100, passMark: 35 }
      ]
    },
    {
      id: '2',
      name: 'English Language',
      code: 'ENGL',
      level: 'O Level',
      papers: [
        { id: '2-1', name: 'Paper 1 (Reading)', duration: 120, totalMarks: 50, passMark: 20 },
        { id: '2-2', name: 'Paper 2 (Writing)', duration: 120, totalMarks: 50, passMark: 20 }
      ]
    },
    {
      id: '3',
      name: 'Physics',
      code: 'PHYS',
      level: 'A Level',
      papers: [
        { id: '3-1', name: 'Paper 1 (Theory)', duration: 180, totalMarks: 80, passMark: 30 },
        { id: '3-2', name: 'Paper 2 (Practical)', duration: 150, totalMarks: 60, passMark: 24 }
      ]
    }
  ]);

  // Filter subjects based on selected exam level
  const filteredSubjects = subjects.filter(subject => subject.level === examLevel);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState<Partial<SubjectType>>({
    name: '',
    code: '',
    level: examLevel,
    papers: []
  });

  const handleSaveGeneral = () => {
    // Here you would typically save the data to your backend
    console.log({
      examLevel,
      session,
      year,
      registrationDeadline,
      examStartDate,
      examEndDate,
      resultsReleaseDate
    });

    setSuccessMessage('Examination settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const addNewSubject = () => {
    // Reset new subject form
    setNewSubject({
      name: '',
      code: '',
      level: examLevel,
      papers: [{ id: `new-${Date.now()}`, name: '', duration: 120, totalMarks: 100, passMark: 40 }]
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = () => {
    if (newSubject.name && newSubject.code) {
      if (newSubject.id) {
        // Editing existing subject
        const updatedSubjects = subjects.map(subject =>
          subject.id === newSubject.id
            ? { ...newSubject, level: examLevel } as SubjectType
            : subject
        );

        setSubjects(updatedSubjects);
        setShowSubjectModal(false);
        setSuccessMessage('Subject updated successfully!');
      } else {
        // Adding new subject
        const subjectToSave = {
          ...newSubject,
          id: `new-${Date.now()}`,
          level: examLevel
        } as SubjectType;

        setSubjects([...subjects, subjectToSave]);
        setShowSubjectModal(false);
        setSuccessMessage('Subject added successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const addPaperToNewSubject = () => {
    if (newSubject.papers) {
      setNewSubject({
        ...newSubject,
        papers: [
          ...newSubject.papers,
          { id: `new-paper-${Date.now()}`, name: '', duration: 120, totalMarks: 100, passMark: 40 }
        ]
      });
    }
  };

  const updateNewPaper = (index: number, field: keyof PaperType, value: any) => {
    if (newSubject.papers) {
      const updatedPapers = [...newSubject.papers];
      updatedPapers[index] = {
        ...updatedPapers[index],
        [field]: field === 'name' ? value : parseInt(value, 10)
      };
      setNewSubject({
        ...newSubject,
        papers: updatedPapers
      });
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Examination Setup</h1>
          <p className="text-gray-600 mt-2">Configure examination parameters, subjects, and grading criteria</p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              className={`px-6 py-4 text-sm font-medium flex items-center ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('general')}
            >
              <Settings size={18} className="mr-2" />
              General Settings
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium flex items-center ${activeTab === 'subjects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('subjects')}
            >
              <FileText size={18} className="mr-2" />
              Subjects & Papers
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium flex items-center ${activeTab === 'grading' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('grading')}
            >
              <Layers size={18} className="mr-2" />
              Grading Criteria
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium flex items-center ${activeTab === 'centers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('centers')}
            >
              <Users size={18} className="mr-2" />
              Examination Centers
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Examination Level</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-md ${examLevel === 'O Level' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                        onClick={() => setExamLevel('O Level')}
                      >
                        O Level
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md ${examLevel === 'A Level' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                        onClick={() => setExamLevel('A Level')}
                      >
                        A Level
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Examination Session</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-md ${session === 'June' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                        onClick={() => setSession('June')}
                      >
                        June Session
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md ${session === 'November' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                        onClick={() => setSession('November')}
                      >
                        November Session
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Important Dates</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={registrationDeadline}
                          onChange={(e) => setRegistrationDeadline(e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Results Release Date</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={resultsReleaseDate}
                          onChange={(e) => setResultsReleaseDate(e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Examination Start Date</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={examStartDate}
                          onChange={(e) => setExamStartDate(e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Examination End Date</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={examEndDate}
                          onChange={(e) => setExamEndDate(e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleSaveGeneral}
                  >
                    <Save size={18} className="mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {examLevel} Subjects and Papers
                  </h3>
                  <button
                    type="button"
                    onClick={addNewSubject}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Subject
                  </button>
                </div>

                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Subject Code</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subject Name</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Papers</th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Total Duration</th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Total Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((subject) => (
                          <tr
                            key={subject.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              // View subject details
                              setNewSubject({
                                ...subject,
                                papers: [...subject.papers]
                              });
                              setShowSubjectModal(true);
                            }}
                          >
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{subject.code}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.name}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.papers.length}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                              {subject.papers.reduce((total, paper) => total + paper.duration, 0)} mins
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                              {subject.papers.reduce((total, paper) => total + paper.totalMarks, 0)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">No subjects found for {examLevel}. Add a new subject to begin.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'grading' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Configure grading criteria for {examLevel}. These settings will affect how marks are converted to final grades.
                      </p>
                    </div>
                  </div>
                </div>

                {examLevel === 'O Level' ? (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">O Level Grade Boundaries</h3>
                    <p className="text-sm text-gray-600">Using the 9-1 grading scale where 9 is the highest grade.</p>

                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Grade</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Minimum Percentage</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">9</td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <input type="number" className="w-20 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue={90} />%
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">Outstanding</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">8</td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <input type="number" className="w-20 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue={80} />%
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">Excellent</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">7</td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <input type="number" className="w-20 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue={70} />%
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">Very Good</td>
                          </tr>
                          {/* More grades would be listed here */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">A Level Grade Boundaries</h3>
                    <p className="text-sm text-gray-600">Using the A*-E grading scale where A* is the highest grade.</p>

                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Grade</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Minimum Percentage</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">UCAS Points</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">A*</td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <input type="number" className="w-20 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue={90} />%
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">56</td>
                            <td className="px-3 py-4 text-sm text-gray-500">Outstanding</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">A</td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <input type="number" className="w-20 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue={80} />%
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">48</td>
                            <td className="px-3 py-4 text-sm text-gray-500">Excellent</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">B</td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <input type="number" className="w-20 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue={70} />%
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">40</td>
                            <td className="px-3 py-4 text-sm text-gray-500">Very Good</td>
                          </tr>
                          {/* More grades would be listed here */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      setSuccessMessage('Grading criteria saved successfully!');
                      setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                  >
                    <Save size={18} className="mr-2" />
                    Save Grading Criteria
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'centers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Examination Centers</h3>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Center
                  </button>
                </div>

                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Center ID</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Center Name</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Capacity</th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr className="hover:bg-gray-50 cursor-pointer">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">CEN-001</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Government Bilingual High School Yaoundé</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Yaoundé, Centre Region</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">500</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 cursor-pointer">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">CEN-002</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Lycée de Bafoussam</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Bafoussam, West Region</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">350</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 cursor-pointer">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">CEN-003</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Collège de Maroua</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Maroua, Far North Region</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">250</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => router.push('/Examination/Centers')}
                  >
                    <Users size={18} className="mr-2" />
                    Manage Centers
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subject Modal */}
        {showSubjectModal && (
          <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {newSubject.id ? 'Edit Subject' : 'Add New Subject'} for {examLevel}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="subject-name" className="block text-sm font-medium text-gray-700">
                        Subject Name
                      </label>
                      <input
                        type="text"
                        id="subject-name"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., Mathematics"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="subject-code" className="block text-sm font-medium text-gray-700">
                        Subject Code
                      </label>
                      <input
                        type="text"
                        id="subject-code"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., MATH"
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-900">Papers</h4>
                        <button
                          type="button"
                          onClick={addPaperToNewSubject}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus size={14} className="mr-1" />
                          Add Paper
                        </button>
                      </div>

                      <div className="mt-2 space-y-4">
                        {newSubject.papers && newSubject.papers.map((paper, index) => (
                          <div key={paper.id} className="border border-gray-200 rounded-md p-3">
                            <div className="mb-2">
                              <label className="block text-xs font-medium text-gray-700">
                                Paper Name
                              </label>
                              <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="e.g., Paper 1 (Multiple Choice)"
                                value={paper.name}
                                onChange={(e) => updateNewPaper(index, 'name', e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">
                                  Duration (mins)
                                </label>
                                <input
                                  type="number"
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={paper.duration}
                                  onChange={(e) => updateNewPaper(index, 'duration', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">
                                  Total Marks
                                </label>
                                <input
                                  type="number"
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={paper.totalMarks}
                                  onChange={(e) => updateNewPaper(index, 'totalMarks', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">
                                  Pass Mark
                                </label>
                                <input
                                  type="number"
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={paper.passMark}
                                  onChange={(e) => updateNewPaper(index, 'passMark', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    onClick={handleSaveSubject}
                  >
                    Save Subject
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowSubjectModal(false)}
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
};

export default ExaminationSetupPage;
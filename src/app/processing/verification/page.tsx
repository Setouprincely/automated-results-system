'use client';

import { useState } from 'react';
import Layout from '@/components/layouts/layout';
import { Search, CheckCircle, XCircle, ArrowRight, Download, Eye } from 'lucide-react';
import Link from 'next/link';

const ResultsVerificationPage = () => {
  const [verificationMethod, setVerificationMethod] = useState<'candidate' | 'qr'>('candidate');
  const [candidateNumber, setCandidateNumber] = useState('');
  const [examType, setExamType] = useState<'olevel' | 'alevel'>('olevel');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resultData, setResultData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationStatus('loading');
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Mock successful verification
      if (candidateNumber.length > 5) {
        setVerificationStatus('success');
        setResultData({
          candidateNumber: candidateNumber,
          candidateName: 'John Doe',
          examType: examType === 'olevel' ? 'Ordinary Level' : 'Advanced Level',
          examYear: examYear,
          dateOfBirth: '2000-05-15',
          center: 'GBHS Bamenda',
          centerCode: 'BAM001',
          subjects: examType === 'olevel' ? [
            { code: 'ENG', name: 'English Language', grade: 'A' },
            { code: 'FRE', name: 'French Language', grade: 'B' },
            { code: 'MAT', name: 'Mathematics', grade: 'A' },
            { code: 'PHY', name: 'Physics', grade: 'B' },
            { code: 'CHE', name: 'Chemistry', grade: 'A' },
            { code: 'BIO', name: 'Biology', grade: 'A' },
            { code: 'GEO', name: 'Geography', grade: 'B' },
            { code: 'HIS', name: 'History', grade: 'C' },
          ] : [
            { code: 'MAT', name: 'Mathematics', grade: 'A' },
            { code: 'PHY', name: 'Physics', grade: 'B' },
            { code: 'CHE', name: 'Chemistry', grade: 'A' },
          ],
          overallGrade: examType === 'olevel' ? 'A' : 'B',
          verificationHash: 'a12b3c4d5e6f7g8h9i0j',
          verificationDate: new Date().toISOString(),
        });
      } else {
        setVerificationStatus('error');
        setResultData(null);
      }
    }, 1500);
  };

  const resetVerification = () => {
    setVerificationStatus('idle');
    setResultData(null);
  };

  const renderVerificationForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            className={`flex-1 py-2 px-4 rounded-md ${
              verificationMethod === 'candidate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setVerificationMethod('candidate')}
          >
            Candidate Number
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md ${
              verificationMethod === 'qr'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setVerificationMethod('qr')}
          >
            Scan QR Code
          </button>
        </div>
      </div>

      {verificationMethod === 'candidate' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Number
            </label>
            <input
              type="text"
              value={candidateNumber}
              onChange={(e) => setCandidateNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your candidate number"
              required
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Examination Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as 'olevel' | 'alevel')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="olevel">O Level</option>
                <option value="alevel">A Level</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Examination Year
              </label>
              <select
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
            disabled={verificationStatus === 'loading'}
          >
            {verificationStatus === 'loading' ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center">
                <Search className="mr-2 w-5 h-5" />
                Verify Results
              </span>
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 w-64 h-64 flex items-center justify-center">
            <span className="text-gray-500 text-center">
              <p className="font-medium mb-2">Scan QR Code</p>
              <p className="text-sm">Position the QR code from your result sheet or certificate within this area</p>
            </span>
          </div>
          <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center">
            <span className="flex items-center">
              <Search className="mr-2 w-5 h-5" />
              Upload QR Code Image
            </span>
          </button>
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">How to verify your results:</h3>
        <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
          <li>Enter your candidate number as shown on your examination slip or certificate</li>
          <li>Select the exam type (O Level or A Level)</li>
          <li>Choose the examination year</li>
          <li>Click "Verify Results" to authenticate your results</li>
          <li>Alternatively, scan the QR code from your results slip or certificate</li>
        </ul>
      </div>
    </div>
  );

  const renderResultsCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{resultData.candidateName}</h2>
          <p className="text-sm opacity-90">Candidate Number: {resultData.candidateNumber}</p>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-300" />
          <span className="text-sm font-medium">Verified</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Examination Type</p>
            <p className="font-medium">{resultData.examType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Examination Year</p>
            <p className="font-medium">{resultData.examYear}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">{resultData.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Examination Center</p>
            <p className="font-medium">{resultData.center} ({resultData.centerCode})</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Subject Results</h3>
          <div className="bg-gray-50 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resultData.subjects.map((subject: any) => (
                  <tr key={subject.code}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {subject.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        subject.grade === 'A' || subject.grade === 'A*' ? 'bg-green-100 text-green-800' :
                        subject.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        subject.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        subject.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subject.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-b mb-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Overall Grade:</span>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              resultData.overallGrade === 'A' || resultData.overallGrade === 'A*' ? 'bg-green-100 text-green-800' :
              resultData.overallGrade === 'B' ? 'bg-blue-100 text-blue-800' :
              resultData.overallGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
              resultData.overallGrade === 'D' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {resultData.overallGrade}
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            Verification Date: {new Date(resultData.verificationDate).toLocaleDateString()}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center">
            <Download className="mr-2 w-5 h-5" />
            Download Results Certificate
          </button>
          
          <div className="flex space-x-3">
            <button 
              onClick={resetVerification}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 flex items-center justify-center"
            >
              <Search className="mr-2 w-5 h-5" />
              Verify Another Result
            </button>
            
            <Link
              href="/results/analytics"
              className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 flex items-center justify-center"
            >
              <Eye className="mr-2 w-5 h-5" />
              View Performance Analytics
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 text-center">
        <p className="text-sm text-gray-500">
          <span className="font-medium">Verification Hash:</span> {resultData.verificationHash}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Results verified via the official GCE Board Verification System
        </p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="mb-4 flex justify-center">
        <XCircle className="w-16 h-16 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
      <p className="text-gray-600 mb-6">
        We couldn't verify the results for the provided candidate number. 
        Please check the information and try again.
      </p>
      <button
        onClick={resetVerification}
        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Results Verification</h1>
          <p className="text-gray-600">
            Verify the authenticity of GCE examination results using candidate number or QR code.
          </p>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <ArrowRight className="mx-2 w-3 h-3" />
          <Link href="/results" className="hover:text-blue-600">Results</Link>
          <ArrowRight className="mx-2 w-3 h-3" />
          <span className="text-gray-800 font-medium">Verification</span>
        </div>

        {verificationStatus === 'idle' && renderVerificationForm()}
        {verificationStatus === 'loading' && (
          <div className="bg-white p-12 rounded-lg shadow-md flex flex-col items-center justify-center">
            <div className="animate-spin mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Verifying Results</h2>
            <p className="text-gray-500">Please wait while we verify the authenticity of the results...</p>
          </div>
        )}
        {verificationStatus === 'success' && renderResultsCard()}
        {verificationStatus === 'error' && renderErrorState()}

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">How do I know if my results are authentic?</h4>
              <p className="text-sm text-gray-600">
                All verified results include a unique verification hash and QR code that can be validated through this system.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">What if I can't find my results?</h4>
              <p className="text-sm text-gray-600">
                Ensure you've entered the correct candidate number, examination type, and year. If problems persist, contact the GCE Board support.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">How long are results available for verification?</h4>
              <p className="text-sm text-gray-600">
                Results remain in the verification system indefinitely. You can verify results from previous years as well.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResultsVerificationPage;
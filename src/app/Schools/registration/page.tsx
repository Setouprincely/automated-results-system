'use client';

import { useState, useEffect } from 'react';
import SchoolsLayout from '@/components/layouts/SchoolsLayout';
import {
  AlertCircle,
  CheckCircle,
  Upload,
  Camera,
  UserPlus,
  Download,
  X,
  Loader2,
  Eye,
  Edit,
  Trash
} from 'lucide-react';

// Form interfaces
interface CandidateForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationalID: string;
  email: string;
  phone: string;
  schoolID: string;
  examCenter: string;
  photo: string | null;
  subjects: string[];
  examType: 'O Level' | 'A Level';
  language: 'English' | 'French';
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
}

// Sample subjects for the form
const SUBJECTS_O_LEVEL = [
  'English Language', 'French', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Geography', 'History', 'Literature in English',
  'Economics', 'Religious Studies', 'Further Mathematics', 'Physical Education'
];

const SUBJECTS_A_LEVEL = [
  'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Economics', 'Geography', 'History', 'Literature in English',
  'French', 'Religious Studies', 'Physical Education'
];

export default function CandidateRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [candidates, setCandidates] = useState<Array<CandidateForm & {id: string}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamType, setFilterExamType] = useState<'All' | 'O Level' | 'A Level'>('All');

  // Initial empty form
  const initialForm: CandidateForm = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationalID: '',
    email: '',
    phone: '',
    schoolID: '', // Would normally come from auth context
    examCenter: '',
    photo: null,
    subjects: [],
    examType: 'O Level',
    language: 'English',
    paymentStatus: 'Pending'
  };

  const [form, setForm] = useState<CandidateForm>(initialForm);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<(CandidateForm & {id: string}) | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch candidates on component mount
  useEffect(() => {
    // This would be an API call in production
    const mockCandidates = [
      {
        id: '1001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2005-05-15',
        gender: 'Male',
        nationalID: 'CM12345678',
        email: 'john.doe@example.com',
        phone: '657123456',
        schoolID: 'SCH001',
        examCenter: 'Yaoundé Center 01',
        photo: null,
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        examType: 'O Level' as const,
        language: 'English' as const,
        paymentStatus: 'Completed' as const
      },
      {
        id: '1002',
        firstName: 'Marie',
        lastName: 'Nguemo',
        dateOfBirth: '2004-09-22',
        gender: 'Female',
        nationalID: 'CM87654321',
        email: 'marie.n@example.com',
        phone: '698765432',
        schoolID: 'SCH001',
        examCenter: 'Yaoundé Center 01',
        photo: null,
        subjects: ['Literature in English', 'History', 'Economics'],
        examType: 'A Level' as const,
        language: 'English' as const,
        paymentStatus: 'Pending' as const
      }
    ];

    setCandidates(mockCandidates);
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });

    // Clear validation error for this field if it exists
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  // Handle subject selection
  const handleSubjectToggle = (subject: string) => {
    // Check if subject is already selected
    if (form.subjects.includes(subject)) {
      setForm({
        ...form,
        subjects: form.subjects.filter(s => s !== subject)
      });
    } else {
      // Check maximum subjects (allow up to 9 for O Level, 4 for A Level)
      const maxSubjects = form.examType === 'O Level' ? 9 : 4;
      if (form.subjects.length < maxSubjects) {
        setForm({
          ...form,
          subjects: [...form.subjects, subject]
        });
      } else {
        setMessage({
          type: 'error',
          text: `Maximum ${maxSubjects} subjects allowed for ${form.examType}`
        });

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  // Handle exam type change
  const handleExamTypeChange = (type: 'O Level' | 'A Level') => {
    setForm({
      ...form,
      examType: type,
      subjects: [] // Reset subjects when changing exam type
    });
  };

  // Mock function to capture photo
  const capturePhoto = () => {
    setWebcamActive(!webcamActive);
    if (webcamActive) {
      // In a real implementation, this would capture the actual webcam image
      setForm({
        ...form,
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5jooor8cP7uCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z'
      });
      setWebcamActive(false);
    }
  };

  // Mock file upload for photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // Here we're just creating a data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          photo: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // First page validation
    if (step === 1) {
      if (!form.firstName.trim()) errors.firstName = 'First name is required';
      if (!form.lastName.trim()) errors.lastName = 'Last name is required';
      if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!form.gender) errors.gender = 'Gender is required';
      if (!form.nationalID.trim()) errors.nationalID = 'National ID is required';

      // Basic email validation
      if (!form.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'Email is invalid';
      }

      // Phone validation - simple check for now
      if (!form.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^\d{9}$/.test(form.phone)) {
        errors.phone = 'Phone number must be 9 digits';
      }
    }

    // Second page validation
    if (step === 2) {
      if (!form.examCenter) errors.examCenter = 'Exam center is required';
      if (form.subjects.length === 0) errors.subjects = 'At least one subject must be selected';

      // Specific validation for exam types
      if (form.examType === 'O Level' && form.subjects.length < 5) {
        errors.subjects = 'O Level requires at least 5 subjects';
      }

      if (form.examType === 'A Level' && form.subjects.length < 3) {
        errors.subjects = 'A Level requires at least 3 subjects';
      }
    }

    return errors;
  };

  // Handle view candidate details
  const handleViewCandidate = (candidate: CandidateForm & {id: string}) => {
    setSelectedCandidate(candidate);
    setShowViewModal(true);
  };

  // Handle edit candidate
  const handleEditCandidate = (candidate: CandidateForm & {id: string}) => {
    setForm(candidate);
    setStep(1);
    setShowForm(true);
    setSelectedCandidate(candidate);
  };

  // Handle delete candidate
  const handleDeleteCandidate = (candidateId: string) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      setCandidates(candidates.filter(c => c.id !== candidateId));
      setMessage({
        type: 'success',
        text: 'Candidate deleted successfully!'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle form submission or next step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setShowConfirmation(true);
    }
  };

  // Handle final submission after confirmation
  const handleConfirmedSubmit = async () => {
    setShowConfirmation(false);
    setIsLoading(true);

    try {
      // This would be an API call in production
      // Mock successful registration for now
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add the new candidate to the list with a mock ID
      const newCandidate = {
        ...form,
        id: `TEMP${Math.floor(Math.random() * 10000)}`
      };

      setCandidates([...candidates, newCandidate]);

      // Reset form and show success message
      setForm(initialForm);
      setStep(1);
      setShowForm(false);
      setMessage({
        type: 'success',
        text: 'Candidate registered successfully!'
      });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch =
      candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.nationalID.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterExamType === 'All' || candidate.examType === filterExamType;

    return matchesSearch && matchesFilter;
  });

  // Handle download of registration data
  const handleDownloadData = () => {
    // In a real application, this would generate a CSV or Excel file
    alert('Download functionality would be implemented here');
  };

  return (
    <SchoolsLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Candidate Registration</h1>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setForm(initialForm);
                  setStep(1);
                  setValidationErrors({});
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                showForm ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white'
              }`}
            >
              {showForm ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {showForm ? 'Cancel' : 'New Candidate'}
            </button>

            <button
              onClick={handleDownloadData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {showForm && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {step === 1 ? 'Personal Information' : 'Examination Details'}
              </h2>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`h-1 w-8 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`h-3 w-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth*
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender*
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {validationErrors.gender && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      National ID*
                    </label>
                    <input
                      type="text"
                      name="nationalID"
                      value={form.nationalID}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.nationalID ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.nationalID && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.nationalID}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g., 657123456"
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Candidate Photo
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        {form.photo ? (
                          <img
                            src={form.photo}
                            alt="Candidate"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm text-center">No photo</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          <Camera className="h-4 w-4" />
                          {webcamActive ? 'Capture Photo' : 'Use Webcam'}
                        </button>
                        <div className="relative">
                          <input
                            type="file"
                            id="photo-upload"
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                          <label
                            htmlFor="photo-upload"
                            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"
                          >
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </label>
                        </div>
                        {form.photo && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, photo: null })}
                            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          >
                            <X className="h-4 w-4" />
                            Remove Photo
                          </button>
                        )}
                        <p className="text-xs text-gray-500">
                          Photo should be a clear passport-sized image with white background
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Type
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handleExamTypeChange('O Level')}
                        className={`px-4 py-2 rounded-md ${
                          form.examType === 'O Level'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        O Level
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExamTypeChange('A Level')}
                        className={`px-4 py-2 rounded-md ${
                          form.examType === 'A Level'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        A Level
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language of Examination
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, language: 'English' })}
                        className={`px-4 py-2 rounded-md ${
                          form.language === 'English'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, language: 'French' })}
                        className={`px-4 py-2 rounded-md ${
                          form.language === 'French'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        French
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Examination Center*
                    </label>
                    <select
                      name="examCenter"
                      value={form.examCenter}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.examCenter ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Exam Center</option>
                      <option value="Yaoundé Center 01">Yaoundé Center 01</option>
                      <option value="Yaoundé Center 02">Yaoundé Center 02</option>
                      <option value="Douala Center 01">Douala Center 01</option>
                      <option value="Douala Center 02">Douala Center 02</option>
                      <option value="Bamenda Center">Bamenda Center</option>
                      <option value="Buea Center">Buea Center</option>
                      <option value="Limbe Center">Limbe Center</option>
                      <option value="Bafoussam Center">Bafoussam Center</option>
                    </select>
                    {validationErrors.examCenter && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.examCenter}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Selection*
                    </label>
                    {validationErrors.subjects && (
                      <p className="mb-2 text-sm text-red-600">{validationErrors.subjects}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">
                      {form.examType === 'O Level'
                        ? 'Select 5-9 subjects for O Level examination'
                        : 'Select 3-4 subjects for A Level examination'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {(form.examType === 'O Level' ? SUBJECTS_O_LEVEL : SUBJECTS_A_LEVEL).map((subject) => (
                        <div
                          key={subject}
                          className={`px-3 py-2 border rounded-md cursor-pointer ${
                            form.subjects.includes(subject)
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-100 border-gray-200 text-gray-800'
                          }`}
                          onClick={() => handleSubjectToggle(subject)}
                        >
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Registration'}
                    </button>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons for Step 1 */}
              {step === 1 && (
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Candidates List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Registered Candidates</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={filterExamType}
                onChange={(e) => setFilterExamType(e.target.value as 'All' | 'O Level' | 'A Level')}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="All">All Levels</option>
                <option value="O Level">O Level</option>
                <option value="A Level">A Level</option>
              </select>
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No candidates found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Center
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {candidate.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.firstName} {candidate.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.examType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.examCenter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.subjects.length} subjects
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          candidate.paymentStatus === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : candidate.paymentStatus === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {candidate.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewCandidate(candidate)}
                          className="text-blue-600 hover:text-blue-800 mr-2 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditCandidate(candidate)}
                          className="text-blue-600 hover:text-blue-800 mr-2 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Registration</h3>
              <p className="mb-6">Are you sure you want to register this candidate? Please verify all information is correct.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm Registration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Candidate Modal */}
        {showViewModal && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Candidate Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ID</h4>
                  <p className="text-gray-900">{selectedCandidate.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                  <p className="text-gray-900">{selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                  <p className="text-gray-900">{new Date(selectedCandidate.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                  <p className="text-gray-900">{selectedCandidate.gender}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">National ID</h4>
                  <p className="text-gray-900">{selectedCandidate.nationalID}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                  <p className="text-gray-900">{selectedCandidate.email} | {selectedCandidate.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Exam Type</h4>
                  <p className="text-gray-900">{selectedCandidate.examType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Exam Center</h4>
                  <p className="text-gray-900">{selectedCandidate.examCenter}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Language</h4>
                  <p className="text-gray-900">{selectedCandidate.language}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Status</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedCandidate.paymentStatus === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : selectedCandidate.paymentStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCandidate.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.subjects.map((subject, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCandidate.photo && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Photo</h4>
                  <div className="w-32 h-32 border border-gray-300">
                    <img
                      src={selectedCandidate.photo}
                      alt="Candidate"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditCandidate(selectedCandidate);
                  }}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit Candidate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span>Processing registration...</span>
            </div>
          </div>
        )}
      </div>
    </SchoolsLayout>
  );
}
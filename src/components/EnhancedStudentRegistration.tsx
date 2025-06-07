'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Shield, Upload, AlertCircle, CheckCircle, Calendar, School, FileText, Users } from 'lucide-react';

interface EnhancedStudentFormData {
  // Basic Information
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Exam Level Selection (Required)
  examLevel: 'O Level' | 'A Level' | '';
  
  // Personal Details
  dateOfBirth: string;
  gender: 'Male' | 'Female' | '';
  nationalIdNumber: string;
  placeOfBirth: string;
  
  // Contact Information
  phoneNumber: string;
  region: string;
  division: string;
  currentAddress: string;
  
  // Guardian Information
  parentGuardianName: string;
  parentGuardianPhone: string;
  parentGuardianRelation: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Educational Background
  previousSchool: string;
  previousSchoolRegion: string;
  yearOfCompletion: string;
  
  // Examination Details
  candidateNumber: string;
  examCenter: string;
  examSession: string;
  
  // Security Information
  securityQuestion: string;
  securityAnswer: string;
  
  // Document Uploads
  photoUpload: File | null;
  birthCertificate: File | null;
  nationalIdCopy: File | null;
  previousResultsUpload: File | null;
  
  // Verification
  agreeToTerms: boolean;
  agreeToDataProcessing: boolean;
  parentalConsent: boolean;
}

interface EnhancedStudentRegistrationProps {
  onSubmit: (data: EnhancedStudentFormData) => Promise<void>;
  loading: boolean;
}

const cameroonRegions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const securityQuestions = [
  'What was the name of your first pet?',
  'What is your mother\'s maiden name?',
  'What was the name of your first school?',
  'What is your favorite book?',
  'What city were you born in?',
  'What is your father\'s middle name?'
];

const examCenters = [
  'Government High School Limbe',
  'Government High School Yaoundé',
  'Government High School Douala',
  'Government High School Bamenda',
  'Government High School Bafoussam',
  'Government High School Garoua',
  'Government High School Maroua',
  'Government High School Bertoua',
  'Government High School Ebolowa',
  'Government High School Ngaoundéré'
];

export default function EnhancedStudentRegistration({ onSubmit, loading }: EnhancedStudentRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EnhancedStudentFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    examLevel: '',
    dateOfBirth: '',
    gender: '',
    nationalIdNumber: '',
    placeOfBirth: '',
    phoneNumber: '',
    region: '',
    division: '',
    currentAddress: '',
    parentGuardianName: '',
    parentGuardianPhone: '',
    parentGuardianRelation: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    previousSchool: '',
    previousSchoolRegion: '',
    yearOfCompletion: '',
    candidateNumber: '',
    examCenter: '',
    examSession: '2025',
    securityQuestion: '',
    securityAnswer: '',
    photoUpload: null,
    birthCertificate: null,
    nationalIdCopy: null,
    previousResultsUpload: null,
    agreeToTerms: false,
    agreeToDataProcessing: false,
    parentalConsent: false
  });

  const [errors, setErrors] = useState<Partial<EnhancedStudentFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is being edited
    if (errors[name as keyof EnhancedStudentFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldName: keyof EnhancedStudentFormData) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<EnhancedStudentFormData> = {};

    switch (step) {
      case 1: // Basic Information & Exam Level
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.examLevel) newErrors.examLevel = 'You must choose between O Level or A Level';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;
        
      case 2: // Security & Contact
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.region) newErrors.region = 'Region is required';
        break;
        
      case 3: // Guardian & Emergency
        if (!formData.parentGuardianName) newErrors.parentGuardianName = 'Parent/Guardian name is required';
        if (!formData.parentGuardianPhone) newErrors.parentGuardianPhone = 'Parent/Guardian phone is required';
        if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact is required';
        break;
        
      case 4: // Educational & Exam Details
        if (!formData.previousSchool) newErrors.previousSchool = 'Previous school is required';
        if (!formData.candidateNumber) newErrors.candidateNumber = 'Candidate number is required';
        if (!formData.examCenter) newErrors.examCenter = 'Exam center is required';
        break;
        
      case 5: // Security & Documents
        if (!formData.securityQuestion) newErrors.securityQuestion = 'Security question is required';
        if (!formData.securityAnswer) newErrors.securityAnswer = 'Security answer is required';
        if (!formData.photoUpload) newErrors.photoUpload = 'Photo upload is required';
        break;
        
      case 6: // Final Verification
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms and conditions';
        if (!formData.agreeToDataProcessing) newErrors.agreeToDataProcessing = 'You must agree to data processing';
        if (!formData.parentalConsent) newErrors.parentalConsent = 'Parental consent is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateStep(6)) {
      await onSubmit(formData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Let's start with your basic details and exam level selection</p>
            </div>

            {/* Exam Level Selection - MOST IMPORTANT */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <label className="block text-lg font-bold text-blue-900 mb-4">
                Choose Your GCE Examination Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'O Level', label: 'GCE Ordinary Level (O Level)', description: 'For students completing secondary education' },
                  { value: 'A Level', label: 'GCE Advanced Level (A Level)', description: 'For students seeking university admission' }
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, examLevel: level.value as 'O Level' | 'A Level' }))}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.examLevel === level.value
                        ? 'border-blue-500 bg-blue-100 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{level.label}</h4>
                      {formData.examLevel === level.value && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </button>
                ))}
              </div>
              {errors.examLevel && (
                <div className="mt-3 flex items-center text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{errors.examLevel}</span>
                </div>
              )}
            </div>

            {/* Basic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter your full name as on official documents"
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
              </div>
            </div>
          </div>
        );

      // Add other steps here...
      default:
        return <div>Step {currentStep} content</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

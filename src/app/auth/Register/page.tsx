// src/app/auth/Register/page.tsx
'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, School, Calendar } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [userType, setUserType] = useState<'student' | 'teacher' | 'examiner'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  interface FormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    school: string;
    dateOfBirth: string;
    candidateNumber: string;
    userType: 'student' | 'teacher' | 'examiner';
  }

  interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    school?: string;
    dateOfBirth?: string;
    candidateNumber?: string;
    form?: string;
  }

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    dateOfBirth: '',
    candidateNumber: '',
    userType: 'student',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  interface Translation {
    title: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    school: string;
    dateOfBirth: string;
    candidateNumber: string;
    register: string;
    alreadyHaveAccount: string;
    login: string;
    userType: string;
    student: string;
    teacher: string;
    examiner: string;
    passwordRequirements: string;
    registrationError: string;
    passwordMismatch: string;
    requiredField: string;
    invalidEmail: string;
  }

  const translations: Record<'en' | 'fr', Translation> = {
    en: {
      title: 'Registration',
      fullName: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      school: 'School/Institution',
      dateOfBirth: 'Date of Birth',
      candidateNumber: 'Candidate Number',
      register: 'Register',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Login',
      userType: 'User Type',
      student: 'Student/Candidate',
      teacher: 'School/Teacher',
      examiner: 'Examiner',
      passwordRequirements: 'Password must be at least 8 characters long with letters, numbers, and special characters.',
      registrationError: 'Registration failed. Please try again.',
      passwordMismatch: 'Passwords do not match',
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
    },
    fr: {
      title: 'Inscription',
      fullName: 'Nom Complet',
      email: 'Adresse Email',
      password: 'Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      school: 'École/Institution',
      dateOfBirth: 'Date de Naissance',
      candidateNumber: 'Numéro de Candidat',
      register: 'S\'inscrire',
      alreadyHaveAccount: 'Vous avez déjà un compte?',
      login: 'Connexion',
      userType: 'Type d\'Utilisateur',
      student: 'Étudiant/Candidat',
      teacher: 'École/Enseignant',
      examiner: 'Examinateur',
      passwordRequirements: 'Le mot de passe doit comporter au moins 8 caractères avec des lettres, des chiffres et des caractères spéciaux.',
      registrationError: 'L\'inscription a échoué. Veuillez réessayer.',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      requiredField: 'Ce champ est obligatoire',
      invalidEmail: 'Veuillez entrer une adresse email valide',
    }
  };

  const t = translations[language];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is being edited
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.fullName) newErrors.fullName = t.requiredField;
    if (!formData.email) newErrors.email = t.requiredField;
    if (!formData.password) newErrors.password = t.requiredField;
    if (!formData.confirmPassword) newErrors.confirmPassword = t.requiredField;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password = t.passwordRequirements;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatch;
    }

    // Student-specific validations
    if (userType === 'student') {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = t.requiredField;
      if (!formData.candidateNumber) newErrors.candidateNumber = t.requiredField;
    }

    // School/Teacher-specific validations
    if (userType === 'teacher') {
      if (!formData.school) newErrors.school = t.requiredField;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Set the user type in the form data
    setFormData(prev => ({
      ...prev,
      userType
    }));

    if (!validateForm()) return;

    setLoading(true);

    try {
      // API call would go here
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful registration
      console.log('Registration form submitted:', formData);

      // Redirect to verification page or login page
      router.push('/registration-success');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ form: t.registrationError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-end mb-4 mx-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 rounded ml-2 ${language === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              FR
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">{t.title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                {t.login}
              </Link>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {/* User Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userType}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      userType === 'student'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setUserType('student')}
                  >
                    {t.student}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      userType === 'teacher'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setUserType('teacher')}
                  >
                    {t.teacher}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      userType === 'examiner'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setUserType('examiner')}
                  >
                    {t.examiner}
                  </button>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    {t.fullName}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 py-3 border ${
                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t.email}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 py-3 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t.password}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-3 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password ? (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">{t.passwordRequirements}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t.confirmPassword}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-3 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Student-specific fields */}
                {userType === 'student' && (
                  <>
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                        {t.dateOfBirth}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className={`block w-full pl-10 py-3 border ${
                            errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.dateOfBirth && (
                        <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="candidateNumber" className="block text-sm font-medium text-gray-700">
                        {t.candidateNumber}
                      </label>
                      <div className="mt-1">
                        <input
                          id="candidateNumber"
                          name="candidateNumber"
                          type="text"
                          value={formData.candidateNumber}
                          onChange={handleInputChange}
                          className={`block w-full py-3 border ${
                            errors.candidateNumber ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.candidateNumber && (
                        <p className="mt-2 text-sm text-red-600">{errors.candidateNumber}</p>
                      )}
                    </div>
                  </>
                )}

                {/* School/Teacher-specific fields */}
                {userType === 'teacher' && (
                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                      {t.school}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <School className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="school"
                        name="school"
                        type="text"
                        value={formData.school}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 py-3 border ${
                          errors.school ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    {errors.school && (
                      <p className="mt-2 text-sm text-red-600">{errors.school}</p>
                    )}
                  </div>
                )}

                {/* Form Error */}
                {errors.form && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      t.register
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}
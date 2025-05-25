'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, School, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

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
    subtitle: string;
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
    selectUserType: string;
    personalInformation: string;
    accountSecurity: string;
    additionalInformation: string;
    processing: string;
    registrationSuccess: string;
    redirecting: string;
  }

  const translations: Record<'en' | 'fr', Translation> = {
    en: {
      title: 'Create Your Account',
      subtitle: 'Join our professional examination platform',
      fullName: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      school: 'School/Institution',
      dateOfBirth: 'Date of Birth',
      candidateNumber: 'Candidate Number',
      register: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Sign In',
      userType: 'Account Type',
      student: 'Student/Candidate',
      teacher: 'School/Teacher',
      examiner: 'Examiner',
      passwordRequirements: 'Password must be at least 8 characters long with letters, numbers, and special characters.',
      registrationError: 'Registration failed. Please try again.',
      passwordMismatch: 'Passwords do not match',
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      selectUserType: 'Select your account type to continue',
      personalInformation: 'Personal Information',
      accountSecurity: 'Account Security',
      additionalInformation: 'Additional Information',
      processing: 'Creating Account...',
      registrationSuccess: 'Registration successful! Welcome to our platform.',
      redirecting: 'Redirecting to your dashboard...',
    },
    fr: {
      title: 'Créer Votre Compte',
      subtitle: 'Rejoignez notre plateforme d\'examen professionnelle',
      fullName: 'Nom Complet',
      email: 'Adresse Email',
      password: 'Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      school: 'École/Institution',
      dateOfBirth: 'Date de Naissance',
      candidateNumber: 'Numéro de Candidat',
      register: 'Créer un Compte',
      alreadyHaveAccount: 'Vous avez déjà un compte?',
      login: 'Se Connecter',
      userType: 'Type de Compte',
      student: 'Étudiant/Candidat',
      teacher: 'École/Enseignant',
      examiner: 'Examinateur',
      passwordRequirements: 'Le mot de passe doit comporter au moins 8 caractères avec des lettres, des chiffres et des caractères spéciaux.',
      registrationError: 'L\'inscription a échoué. Veuillez réessayer.',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      requiredField: 'Ce champ est obligatoire',
      invalidEmail: 'Veuillez entrer une adresse email valide',
      selectUserType: 'Sélectionnez votre type de compte pour continuer',
      personalInformation: 'Informations Personnelles',
      accountSecurity: 'Sécurité du Compte',
      additionalInformation: 'Informations Supplémentaires',
      processing: 'Création du Compte...',
      registrationSuccess: 'Inscription réussie! Bienvenue sur notre plateforme.',
      redirecting: 'Redirection vers votre tableau de bord...',
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
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful registration
      console.log('Registration form submitted:', { ...formData, userType });

      // Show success message
      alert(t.registrationSuccess);

      // Brief delay before redirect to show success state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to appropriate dashboard based on user type
      switch(userType) {
        case 'student':
          router.push('/Student/dashboard');
          break;
        case 'teacher':
          router.push('/Schools/dashboard');
          break;
        case 'examiner':
          router.push('/Examinar/dashboard');
          break;
        default:
          router.push('/Student/dashboard');
          break;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ form: t.registrationError });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    if (password.length === 0) return null;
    if (password.length < 4) return 'weak';
    if (password.length < 8) return 'medium';
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*#?&]/.test(password);
    if (hasLetter && hasNumber && hasSpecial) return 'strong';
    return 'medium';
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                <img
                  src="/images/GCEB.png"
                  alt="GCE Board Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GCE Board</h1>
                <p className="text-xs text-gray-500">Cameroon GCE Examination System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  language === 'fr'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Français
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">{t.title}</h2>
            <p className="text-lg text-gray-600 mb-8">{t.subtitle}</p>
            <div className="text-sm text-gray-500">
              {t.alreadyHaveAccount}{' '}
              <Link href="/auth/Login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                {t.login}
              </Link>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-8 lg:p-12">
              {/* Account Type Selection */}
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{t.userType}</h3>
                </div>
                <p className="text-gray-600 mb-6">{t.selectUserType}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { type: 'student', icon: User, label: t.student },
                    { type: 'teacher', icon: School, label: t.teacher },
                    { type: 'examiner', icon: CheckCircle, label: t.examiner }
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      type="button"
                      className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        userType === type
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setUserType(type as 'student' | 'teacher' | 'examiner')}
                    >
                      <Icon className={`w-8 h-8 mb-3 ${userType === type ? 'text-blue-600' : 'text-gray-400'}`} />
                      <h4 className={`font-semibold text-sm ${userType === type ? 'text-blue-900' : 'text-gray-900'}`}>
                        {label}
                      </h4>
                      {userType === type && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{t.personalInformation}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.fullName} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          autoComplete="name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                            errors.fullName
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-2 focus:ring-opacity-20`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.fullName && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.fullName}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.email} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                            errors.email
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-2 focus:ring-opacity-20`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {errors.email && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Security Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{t.accountSecurity}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Password */}
                    <div className="sm:col-span-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.password} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                            errors.password
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-2 focus:ring-opacity-20`}
                          placeholder="Create a secure password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex space-x-1 flex-1">
                              <div className={`h-2 rounded-full flex-1 ${strength === 'weak' ? 'bg-red-300' : strength === 'medium' ? 'bg-yellow-300' : strength === 'strong' ? 'bg-green-300' : 'bg-gray-200'}`} />
                              <div className={`h-2 rounded-full flex-1 ${strength === 'medium' ? 'bg-yellow-300' : strength === 'strong' ? 'bg-green-300' : 'bg-gray-200'}`} />
                              <div className={`h-2 rounded-full flex-1 ${strength === 'strong' ? 'bg-green-300' : 'bg-gray-200'}`} />
                            </div>
                            <span className={`text-xs font-medium ${strength === 'weak' ? 'text-red-600' : strength === 'medium' ? 'text-yellow-600' : strength === 'strong' ? 'text-green-600' : 'text-gray-400'}`}>
                              {strength === 'weak' ? 'Weak' : strength === 'medium' ? 'Medium' : strength === 'strong' ? 'Strong' : ''}
                            </span>
                          </div>
                        </div>
                      )}

                      {errors.password ? (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.password}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">{t.passwordRequirements}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="sm:col-span-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.confirmPassword} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                            errors.confirmPassword
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-2 focus:ring-opacity-20`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                {(userType === 'student' || userType === 'teacher') && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">4</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{t.additionalInformation}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Student-specific fields */}
                      {userType === 'student' && (
                        <>
                          <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                              {t.dateOfBirth} *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 transition-all duration-200 ${
                                  errors.dateOfBirth
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                } focus:ring-2 focus:ring-opacity-20`}
                              />
                            </div>
                            {errors.dateOfBirth && (
                              <div className="mt-2 flex items-center text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.dateOfBirth}
                              </div>
                            )}
                          </div>

                          <div>
                            <label htmlFor="candidateNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                              {t.candidateNumber} *
                            </label>
                            <input
                              id="candidateNumber"
                              name="candidateNumber"
                              type="text"
                              value={formData.candidateNumber}
                              onChange={handleInputChange}
                              className={`block w-full px-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                                errors.candidateNumber
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                              } focus:ring-2 focus:ring-opacity-20`}
                              placeholder="Enter your candidate number"
                            />
                            {errors.candidateNumber && (
                              <div className="mt-2 flex items-center text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.candidateNumber}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Teacher-specific fields */}
                      {userType === 'teacher' && (
                        <div className="sm:col-span-2">
                          <label htmlFor="school" className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.school} *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <School className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              id="school"
                              name="school"
                              type="text"
                              value={formData.school}
                              onChange={handleInputChange}
                              className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                                errors.school
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                              } focus:ring-2 focus:ring-opacity-20`}
                              placeholder="Enter your school or institution name"
                            />
                          </div>
                          {errors.school && (
                            <div className="mt-2 flex items-center text-sm text-red-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.school}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Error */}
                {errors.form && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                      <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {t.processing}
                      </div>
                    ) : (
                      t.register
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              By creating an account, you agree to our{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
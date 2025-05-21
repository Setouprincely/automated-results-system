'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layouts/layout';
import {
  User,
  UserCircle,
  FileText,
  Shield,
  Bell,
  Camera
} from 'lucide-react';

// User profile interface
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'examiner' | 'school' | 'student';
  language: 'en' | 'fr';
  photo?: string;
  phone?: string;
  lastLogin?: string;
  school?: string;
  candidateId?: string; // For students
  examinerId?: string; // For examiners
  subjects?: string[]; // For examiners and students
}

// Mock user data - in production, this would come from an API
const mockUserProfile: UserProfile = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'student',
  language: 'en',
  photo: '/api/placeholder/150/150',
  phone: '+237 678 123 456',
  lastLogin: '2025-05-18T10:30:00Z',
  school: 'Government Bilingual High School, Yaoundé',
  candidateId: 'GCE-2025-123456',
  subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology']
};

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  // Translation texts
  const translations = {
    en: {
      title: 'Profile Management',
      personalInfo: 'Personal Information',
      security: 'Security Settings',
      notifications: 'Notifications',
      documents: 'Documents',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      school: 'School/Institution',
      candidateId: 'Candidate ID',
      role: 'User Role',
      lastLogin: 'Last Login',
      language: 'Language Preference',
      subjects: 'Registered Subjects',
      uploadPhoto: 'Upload Photo',
      english: 'English',
      french: 'French',
      logout: 'Logout',
      admin: 'System Administrator',
      examiner: 'Examiner',
      schoolAdmin: 'School Administrator',
      student: 'Student/Candidate',
      twoFactorAuth: 'Two-Factor Authentication',
      passwordChange: 'Change Password',
      loginHistory: 'Login History',
      deviceManager: 'Manage Devices',
      enable: 'Enable',
      disable: 'Disable',
      currentlyEnabled: 'Currently Enabled',
      currentlyDisabled: 'Currently Disabled',
      examNotifications: 'Examination Notifications',
      resultNotifications: 'Results Notifications',
      systemUpdates: 'System Updates',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      certificateRequest: 'Certificate Request',
      resultVerification: 'Result Verification',
      identityDocuments: 'Identity Documents',
    },
    fr: {
      title: 'Gestion de Profil',
      personalInfo: 'Informations Personnelles',
      security: 'Paramètres de Sécurité',
      notifications: 'Notifications',
      documents: 'Documents',
      editProfile: 'Modifier le Profil',
      saveChanges: 'Enregistrer les Modifications',
      cancel: 'Annuler',
      name: 'Nom Complet',
      email: 'Adresse Email',
      phone: 'Numéro de Téléphone',
      school: 'École/Institution',
      candidateId: 'ID de Candidat',
      role: 'Rôle d\'Utilisateur',
      lastLogin: 'Dernière Connexion',
      language: 'Préférence de Langue',
      subjects: 'Matières Inscrites',
      uploadPhoto: 'Télécharger Photo',
      english: 'Anglais',
      french: 'Français',
      logout: 'Déconnexion',
      admin: 'Administrateur Système',
      examiner: 'Examinateur',
      schoolAdmin: 'Administrateur d\'École',
      student: 'Étudiant/Candidat',
      twoFactorAuth: 'Authentification à Deux Facteurs',
      passwordChange: 'Changer le Mot de Passe',
      loginHistory: 'Historique de Connexion',
      deviceManager: 'Gérer les Appareils',
      enable: 'Activer',
      disable: 'Désactiver',
      currentlyEnabled: 'Actuellement Activé',
      currentlyDisabled: 'Actuellement Désactivé',
      examNotifications: 'Notifications d\'Examen',
      resultNotifications: 'Notifications de Résultats',
      systemUpdates: 'Mises à Jour Système',
      emailNotifications: 'Notifications par Email',
      smsNotifications: 'Notifications par SMS',
      certificateRequest: 'Demande de Certificat',
      resultVerification: 'Vérification des Résultats',
      identityDocuments: 'Documents d\'Identité',
    }
  };

  useEffect(() => {
    // In a real application, this would be an API call
    const fetchUserProfile = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setUserProfile(mockUserProfile);
        setFormData(mockUserProfile);
        setLanguage(mockUserProfile.language);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as 'en' | 'fr';
    setLanguage(newLanguage);
    setFormData(prev => ({ ...prev, language: newLanguage }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // In a real application, this would be an API call
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserProfile(prevProfile => ({
        ...prevProfile!,
        ...formData
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = translations[language];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">{language === 'en' ? 'Loading...' : 'Chargement...'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    router.push('/auth/login');
    return null;
  }

  // Format date to local format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleString(language === 'en' ? 'en-CM' : 'fr-CM', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Role display text
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return t.admin;
      case 'examiner': return t.examiner;
      case 'school': return t.schoolAdmin;
      case 'student': return t.student;
      default: return role;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with user info */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-4 md:mb-0 md:mr-6">
                <div className="w-24 h-24 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                  {userProfile.photo ? (
                    <img
                      src={userProfile.photo}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle size={80} />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-1 shadow-lg">
                    <Camera size={16} />
                  </button>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                <p className="text-blue-100">{getRoleDisplay(userProfile.role)}</p>
                <p className="text-blue-100">{userProfile.email}</p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium shadow-md hover:bg-blue-50"
                  >
                    {t.editProfile}
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/20 text-white rounded-md font-medium hover:bg-white/30"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium shadow-md hover:bg-blue-50"
                    >
                      {t.saveChanges}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="border-b">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'personal'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  <User size={18} className="mr-2" />
                  {t.personalInfo}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  <Shield size={18} className="mr-2" />
                  {t.security}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  <Bell size={18} className="mr-2" />
                  {t.notifications}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  <FileText size={18} className="mr-2" />
                  {t.documents}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.phone || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.language}</label>
                    {isEditing ? (
                      <select
                        name="language"
                        value={formData.language || 'en'}
                        onChange={handleLanguageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">{t.english}</option>
                        <option value="fr">{t.french}</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{language === 'en' ? t.english : t.french}</p>
                    )}
                  </div>

                  {userProfile.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.school}</label>
                        <p className="text-gray-900">{userProfile.school || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.candidateId}</label>
                        <p className="text-gray-900">{userProfile.candidateId || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {(userProfile.role === 'student' || userProfile.role === 'examiner') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.subjects}</label>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.subjects?.map((subject, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.role}</label>
                    <p className="text-gray-900">{getRoleDisplay(userProfile.role)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastLogin}</label>
                    <p className="text-gray-900">{formatDate(userProfile.lastLogin)}</p>
                  </div>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-medium text-gray-900">{t.passwordChange}</h3>
                  </div>
                  <div className="p-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
                      {language === 'en' ? 'Change Password' : 'Changer le Mot de Passe'}
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-medium text-gray-900">{t.twoFactorAuth}</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {language === 'en'
                            ? 'Secure your account with two-factor authentication'
                            : 'Sécurisez votre compte avec l\'authentification à deux facteurs'}
                        </p>
                        <p className="text-sm font-medium mt-1 text-orange-600">
                          {t.currentlyDisabled}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
                        {t.enable}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-medium text-gray-900">{t.deviceManager}</h3>
                  </div>
                  <div className="p-4">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">
                      {language === 'en' ? 'Manage Devices' : 'Gérer les Appareils'}
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-medium text-gray-900">{t.loginHistory}</h3>
                  </div>
                  <div className="p-4">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">
                      {language === 'en' ? 'View Login History' : 'Voir l\'Historique de Connexion'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t.examNotifications}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{t.emailNotifications}</p>
                        <p className="text-sm text-gray-500">
                          {language === 'en'
                            ? 'Receive examination updates via email'
                            : 'Recevoir les mises à jour d\'examen par email'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{t.smsNotifications}</p>
                        <p className="text-sm text-gray-500">
                          {language === 'en'
                            ? 'Receive examination updates via SMS'
                            : 'Recevoir les mises à jour d\'examen par SMS'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t.resultNotifications}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{t.emailNotifications}</p>
                        <p className="text-sm text-gray-500">
                          {language === 'en'
                            ? 'Receive results updates via email'
                            : 'Recevoir les mises à jour de résultats par email'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{t.smsNotifications}</p>
                        <p className="text-sm text-gray-500">
                          {language === 'en'
                            ? 'Receive results updates via SMS'
                            : 'Recevoir les mises à jour de résultats par SMS'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t.systemUpdates}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{t.emailNotifications}</p>
                        <p className="text-sm text-gray-500">
                          {language === 'en'
                            ? 'Receive system updates via email'
                            : 'Recevoir les mises à jour système par email'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {userProfile.role === 'student' && (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="text-lg font-medium text-gray-900">{t.certificateRequest}</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-4">
                          {language === 'en'
                            ? 'Request your official GCE certificate'
                            : 'Demander votre certificat GCE officiel'}
                        </p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
                          {language === 'en' ? 'Request Certificate' : 'Demander un Certificat'}
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="text-lg font-medium text-gray-900">{t.resultVerification}</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-4">
                          {language === 'en'
                            ? 'Verify your examination results'
                            : 'Vérifier vos résultats d\'examen'}
                        </p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
                          {language === 'en' ? 'Verify Results' : 'Vérifier les Résultats'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-medium text-gray-900">{t.identityDocuments}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 mb-4">
                      {language === 'en'
                        ? 'Upload your identity documents for verification'
                        : 'Télécharger vos documents d\'identité pour vérification'}
                    </p>
                    <div className="mt-2">
                      <input
                        type="file"
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layouts/StudentLayout';
import { Calendar, Clock, MapPin, ArrowRight, Filter, Download, Bell } from 'lucide-react';
import Link from 'next/link';

// Types
interface Exam {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  centerCode: string;
  examType: 'O Level' | 'A Level';
  paperNumber: string;
  paperTitle: string;
}

const ExamSchedulePage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [filter, setFilter] = useState<string>('all');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Mock data - in a real application this would be fetched from an API
  useEffect(() => {
    // Remove artificial delay for better performance
    try {
      const mockExams: Exam[] = [
        {
          id: '1',
          subject: 'Mathematics',
          date: '2025-06-02',
          startTime: '09:00',
          endTime: '12:00',
          duration: '3 hours',
          location: 'Lycée Bilingue de Yaoundé',
          centerCode: 'YDE001',
          examType: 'O Level',
          paperNumber: 'Paper 1',
          paperTitle: 'Pure Mathematics'
        },
        {
          id: '2',
          subject: 'Physics',
          date: '2025-06-04',
          startTime: '13:00',
          endTime: '16:00',
          duration: '3 hours',
          location: 'Lycée Bilingue de Yaoundé',
          centerCode: 'YDE001',
          examType: 'O Level',
          paperNumber: 'Paper 2',
          paperTitle: 'Mechanics & Electricity'
        },
        {
          id: '3',
          subject: 'English Language',
          date: '2025-06-07',
          startTime: '09:00',
          endTime: '11:30',
          duration: '2.5 hours',
          location: 'Lycée Bilingue de Yaoundé',
          centerCode: 'YDE001',
          examType: 'O Level',
          paperNumber: 'Paper 1',
          paperTitle: 'Comprehension & Summary'
        },
        {
          id: '4',
          subject: 'Chemistry',
          date: '2025-06-09',
          startTime: '09:00',
          endTime: '12:00',
          duration: '3 hours',
          location: 'Lycée Bilingue de Yaoundé',
          centerCode: 'YDE001',
          examType: 'A Level',
          paperNumber: 'Paper 3',
          paperTitle: 'Practical'
        },
        {
          id: '5',
          subject: 'Literature in English',
          date: '2025-06-11',
          startTime: '13:00',
          endTime: '16:00',
          duration: '3 hours',
          location: 'Lycée Bilingue de Yaoundé',
          centerCode: 'YDE001',
          examType: 'A Level',
          paperNumber: 'Paper 1',
          paperTitle: 'Drama & Poetry'
        }
      ];
      setExams(mockExams);
      setLoading(false);
    } catch (err) {
      setError('Failed to load exam schedule. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Functions for filtering exams
  const filteredExams = exams.filter(exam => {
    if (filter === 'all') return true;
    if (filter === 'olevel') return exam.examType === 'O Level';
    if (filter === 'alevel') return exam.examType === 'A Level';

    // Filter by date
    const currentDate = new Date();
    const examDate = new Date(exam.date);

    if (filter === 'upcoming') {
      return examDate >= currentDate;
    }
    if (filter === 'past') {
      return examDate < currentDate;
    }
    if (filter === 'today') {
      return examDate.toDateString() === currentDate.toDateString();
    }

    return true;
  });

  // Sort exams by date
  const sortedExams = [...filteredExams].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-GB' : 'fr-FR', options);
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  // Set up notification
  const setupReminder = (exam: Exam) => {
    setSelectedExam(exam);
    setShowReminderModal(true);
  };

  // Generate calendar download (ICS format - mock function)
  const downloadCalendar = () => {
    alert(language === 'en' ?
      'Your exam schedule has been downloaded to your calendar.' :
      'Votre calendrier d\'examen a été téléchargé dans votre calendrier.');
  };

  // Translations
  const translations = {
    en: {
      title: 'Exam Schedule',
      loading: 'Loading your exam schedule...',
      error: 'Error loading schedule',
      noExams: 'No exams found for your selection.',
      filter: 'Filter',
      all: 'All Exams',
      olevel: 'O Level',
      alevel: 'A Level',
      upcoming: 'Upcoming',
      past: 'Past',
      today: 'Today',
      subject: 'Subject',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      location: 'Location',
      centerCode: 'Center Code',
      examType: 'Exam Type',
      paper: 'Paper',
      downloadCalendar: 'Download Schedule',
      setReminder: 'Set Reminder',
      close: 'Close',
      reminderTitle: 'Set Exam Reminder',
      reminderText: 'You will receive a notification 24 hours before, 1 hour before, and 15 minutes before your exam.',
      confirmReminder: 'Confirm',
      viewDetails: 'View Details',
      examMaterials: 'Required Materials',
      examMaterialsText: 'Remember to bring your ID card, admission letter, pens, and calculator (if allowed).'
    },
    fr: {
      title: 'Calendrier des Examens',
      loading: 'Chargement de votre calendrier d\'examen...',
      error: 'Erreur lors du chargement du calendrier',
      noExams: 'Aucun examen trouvé pour votre sélection.',
      filter: 'Filtrer',
      all: 'Tous les Examens',
      olevel: 'O Level',
      alevel: 'A Level',
      upcoming: 'À venir',
      past: 'Passés',
      today: 'Aujourd\'hui',
      subject: 'Matière',
      date: 'Date',
      time: 'Heure',
      duration: 'Durée',
      location: 'Lieu',
      centerCode: 'Code du Centre',
      examType: 'Type d\'Examen',
      paper: 'Épreuve',
      downloadCalendar: 'Télécharger le Calendrier',
      setReminder: 'Définir un Rappel',
      close: 'Fermer',
      reminderTitle: 'Définir un Rappel d\'Examen',
      reminderText: 'Vous recevrez une notification 24 heures avant, 1 heure avant et 15 minutes avant votre examen.',
      confirmReminder: 'Confirmer',
      viewDetails: 'Voir les Détails',
      examMaterials: 'Matériels Requis',
      examMaterialsText: 'N\'oubliez pas d\'apporter votre carte d\'identité, votre lettre d\'admission, des stylos et une calculatrice (si autorisée).'
    }
  };

  const t = translations[language];

  return (
    <StudentLayout>
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <button
                onClick={toggleLanguage}
                className="bg-white text-blue-800 px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                {language === 'en' ? 'Français' : 'English'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600">{t.loading}</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
              <p className="font-medium">{t.error}</p>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Control Bar */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">{t.filter}:</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded p-1 text-sm"
                  >
                    <option value="all">{t.all}</option>
                    <option value="olevel">{t.olevel}</option>
                    <option value="alevel">{t.alevel}</option>
                    <option value="upcoming">{t.upcoming}</option>
                    <option value="past">{t.past}</option>
                    <option value="today">{t.today}</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={downloadCalendar}
                    className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>{t.downloadCalendar}</span>
                  </button>
                </div>
              </div>

              {/* Exam Materials Reminder */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Bell className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">{t.examMaterials}</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>{t.examMaterialsText}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exams List */}
              {sortedExams.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                  {t.noExams}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedExams.map((exam) => (
                    <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className={`px-4 py-3 ${exam.examType === 'O Level' ? 'bg-green-50' : 'bg-purple-50'}`}>
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-gray-800">{exam.subject}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            exam.examType === 'O Level' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {exam.examType} - {exam.paperNumber}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{exam.paperTitle}</p>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm text-gray-500">{t.date}</span>
                              <p className="font-medium">{formatDate(exam.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm text-gray-500">{t.time}</span>
                              <p className="font-medium">{exam.startTime} - {exam.endTime} ({exam.duration})</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm text-gray-500">{t.location}</span>
                              <p className="font-medium">{exam.location}</p>
                              <p className="text-sm text-gray-500">{t.centerCode}: {exam.centerCode}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => setupReminder(exam)}
                            className="flex items-center text-blue-700 hover:text-blue-900"
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            <span className="text-sm">{t.setReminder}</span>
                          </button>

                          <Link href={`/student/exam-details/${exam.id}`}>
                            <span className="flex items-center text-blue-700 hover:text-blue-900">
                              <span className="text-sm">{t.viewDetails}</span>
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{t.reminderTitle}</h3>
            <p className="text-gray-600 mb-4">{selectedExam.subject} - {formatDate(selectedExam.date)}</p>
            <p className="text-gray-600 mb-6">{t.reminderText}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  alert(language === 'en' ?
                    'Reminder set successfully!' :
                    'Rappel défini avec succès !');
                  setShowReminderModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t.confirmReminder}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default ExamSchedulePage;

// pages/help-support.tsx
"use client";
import { useState } from 'react';
import Layout from '@/components/layouts/layout';
import { 
  Search, 
  Book, 
  MessageCircle, 
  HelpCircle, 
  Video, 
  FileText, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

// FAQ data structure
const faqData = [
  {
    id: 1,
    question: "How do I register as a new candidate?",
    answer: "To register as a new candidate, log in to your account, navigate to the 'Registration' section, and follow the step-by-step instructions. You will need to provide personal information, select examination subjects, upload a photo, and complete the payment process."
  },
  {
    id: 2,
    question: "What should I do if I forget my password?",
    answer: "If you forget your password, click on the 'Forgot Password' link on the login page. You'll need to enter your registered email address or phone number to receive a password reset link. Follow the instructions in the email/SMS to create a new password."
  },
  {
    id: 3,
    question: "How can I check my examination results?",
    answer: "Results can be checked by logging into your account during the official results release period. Navigate to the 'Results' section and select the appropriate examination session. You can view, download, or request a printed copy of your results."
  },
  {
    id: 4,
    question: "What grading system is used for O Level examinations?",
    answer: "The O Level examinations use a 9-1 grading scale, with 9 being the highest grade and 1 being the lowest passing grade. Each subject has specific grade boundaries determined by the examination board."
  },
  {
    id: 5,
    question: "How do I report an issue with my results?",
    answer: "To report an issue with your results, use the 'Result Verification Request' form in your dashboard. Provide specific details about the discrepancy, upload any supporting evidence, and submit the form. The examination board will review your request and respond within 14 working days."
  },
  {
    id: 6,
    question: "Is the system available in both English and French?",
    answer: "Yes, the entire system is available in both English and French. You can toggle between languages using the language selector at the top right corner of any page."
  },
  {
    id: 7,
    question: "What should schools do to register their students?",
    answer: "School administrators should log in to their institutional accounts, navigate to 'Student Management', and follow the batch registration process. The system allows uploading student lists in Excel format, individual student registration, and management of subject selections."
  },
  {
    id: 8,
    question: "How can I get help if I'm in an area with poor internet connectivity?",
    answer: "The system is designed to work with intermittent internet connections. You can also contact our support center via SMS at the provided number, visit any of our regional offices, or request assistance through a designated school coordinator."
  }
];

// Resource categories
const resourceCategories = [
  {
    icon: <Book className="h-6 w-6" />,
    title: "User Guides",
    description: "Comprehensive guides for all user types",
    links: [
      { title: "Student User Guide", url: "/resources/student-guide" },
      { title: "School Administrator Guide", url: "/resources/school-admin-guide" },
      { title: "Examiner Handbook", url: "/resources/examiner-handbook" }
    ]
  },
  {
    icon: <Video className="h-6 w-6" />,
    title: "Video Tutorials",
    description: "Step-by-step visual instructions",
    links: [
      { title: "Registration Process", url: "/tutorials/registration" },
      { title: "Navigating Your Dashboard", url: "/tutorials/dashboard" },
      { title: "Checking & Understanding Results", url: "/tutorials/results" }
    ]
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Documentation",
    description: "Technical documents and references",
    links: [
      { title: "System Requirements", url: "/docs/system-requirements" },
      { title: "Data Privacy Policy", url: "/docs/privacy-policy" },
      { title: "Examination Regulations", url: "/docs/exam-regulations" }
    ]
  }
];

const HelpAndSupport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('faq');

  // Handle FAQ toggle
  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Filter FAQs based on search term
  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-blue-800">Help & Support Center</h1>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Get assistance with using the GCE Results Examination and Grading System for Cameroon.
              Browse our resources or contact our support team.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-6 border-b">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('faq')}
            >
              <HelpCircle className="h-4 w-4 inline mr-1" />
              Frequently Asked Questions
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'resources'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('resources')}
            >
              <Book className="h-4 w-4 inline mr-1" />
              Resources
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              <MessageCircle className="h-4 w-4 inline mr-1" />
              Contact Support
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Frequently Asked Questions</h2>
                
                {searchTerm && filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No results found for "{searchTerm}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try using different keywords or contact our support team</p>
                  </div>
                )}

                <div className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <div 
                      key={faq.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                    >
                      <button
                        className="w-full px-4 py-3 text-left flex justify-between items-center focus:outline-none"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <span className="font-medium text-gray-800">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="h-5 w-5 text-blue-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 text-gray-600 bg-gray-50 border-t border-gray-100">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Support Resources</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {resourceCategories.map((category, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                          {category.icon}
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">{category.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <ul className="space-y-2">
                        {category.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <a 
                              href={link.url} 
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {link.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Need additional resources?</h3>
                  <p className="text-gray-600">
                    Our resource library is regularly updated. If you can't find what you're looking for,
                    please contact our support team or check back later.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Support</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Support Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Regular Period</h4>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 4:30 PM</p>
                      <p className="text-gray-600">Saturday: 9:00 AM - 12:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Examination Period</h4>
                      <p className="text-gray-600">Monday - Saturday: 7:00 AM - 7:00 PM</p>
                      <p className="text-gray-600">Sunday: 9:00 AM - 3:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-2 rounded-full text-green-600 mr-3">
                        <Phone className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">Phone Support</h3>
                    </div>
                    <p className="text-gray-600 mb-2">General Inquiries:</p>
                    <p className="text-lg font-medium text-gray-800 mb-4">+237 222 123 456</p>
                    <p className="text-gray-600 mb-2">Technical Support:</p>
                    <p className="text-lg font-medium text-gray-800">+237 222 789 012</p>
                    <p className="text-sm text-gray-500 mt-4">
                      For urgent matters during support hours only.
                      Standard network rates apply.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                        <Mail className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">Email Support</h3>
                    </div>
                    <p className="text-gray-600 mb-2">General Inquiries:</p>
                    <p className="text-lg font-medium text-blue-600 mb-4">support@gcecameroon.cm</p>
                    <p className="text-gray-600 mb-2">Technical Issues:</p>
                    <p className="text-lg font-medium text-blue-600">techsupport@gcecameroon.cm</p>
                    <p className="text-sm text-gray-500 mt-4">
                      Response time: within 24-48 hours during working days.
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Regional Support Centers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Yaoundé Center</h4>
                      <p className="text-gray-600">123 Avenue de l'Indépendance</p>
                      <p className="text-gray-600">Yaoundé, Cameroon</p>
                      <p className="text-gray-600">+237 222 111 222</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Douala Center</h4>
                      <p className="text-gray-600">456 Boulevard de la Liberté</p>
                      <p className="text-gray-600">Douala, Cameroon</p>
                      <p className="text-gray-600">+237 222 333 444</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Bamenda Center</h4>
                      <p className="text-gray-600">78 Commercial Avenue</p>
                      <p className="text-gray-600">Bamenda, Cameroon</p>
                      <p className="text-gray-600">+237 222 555 666</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Buea Center</h4>
                      <p className="text-gray-600">91 Great Soppo Road</p>
                      <p className="text-gray-600">Buea, Cameroon</p>
                      <p className="text-gray-600">+237 222 777 888</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Submit a Support Ticket</h3>
                  <form className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                        User Type
                      </label>
                      <select
                        id="userType"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select your user type</option>
                        <option value="student">Student/Candidate</option>
                        <option value="school">School Administrator</option>
                        <option value="examiner">Examiner/Marker</option>
                        <option value="official">Examination Board Official</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please describe your issue in detail"
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                        Attachment (Optional)
                      </label>
                      <input
                        type="file"
                        id="attachment"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Maximum file size: 5MB (Supported formats: JPG, PNG, PDF)
                      </p>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="consent"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
                        I consent to the processing of my personal data according to the privacy policy
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    >
                      Submit Ticket
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Quick Help Section */}
          <div className="mt-12 bg-blue-600 text-white rounded-lg p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold">Need Immediate Assistance?</h3>
                <p className="mt-1">Our support team is available to help you with any urgent issues.</p>
              </div>
              <div className="flex space-x-4">
                <a 
                  href="/live-chat" 
                  className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </a>
                <a 
                  href="tel:+237222123456" 
                  className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpAndSupport;
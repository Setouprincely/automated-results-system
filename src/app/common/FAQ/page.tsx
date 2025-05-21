'use client';

import { useState } from 'react';
import Layout from '@/components/layouts/layout';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import Head from 'next/head';

// FAQ Categories and questions
const faqData = [
  {
    category: "Registration",
    questions: [
      {
        question: "How do I register for the GCE examination?",
        answer: "Registration can be completed through your school's coordinator or directly on our platform. You'll need to create an account, provide personal information, select your subjects, and pay the registration fee. Photo submission is also required for ID generation."
      },
      {
        question: "What are the registration deadlines?",
        answer: "Registration deadlines vary by examination cycle. Generally, early registration opens 6 months before exams and closes 3 months before. Late registration with additional fees may be available up to 2 months before exams. Check the current academic calendar for exact dates."
      },
      {
        question: "How do I pay for registration?",
        answer: "Our system supports multiple payment methods including mobile money (MTN Mobile Money, Orange Money), bank transfers, and online payments. Your school can also collect fees and make bulk payments on behalf of students."
      },
      {
        question: "Can I change my registered subjects after submission?",
        answer: "Subject changes are possible until the registration deadline. After that, changes are only permitted in exceptional circumstances and may incur additional fees. Contact your examination center or our support team directly."
      }
    ]
  },
  {
    category: "Examination Process",
    questions: [
      {
        question: "How will I know my examination center and schedule?",
        answer: "After successful registration, you can access your examination details (center, dates, times) through your student dashboard. You'll also receive an SMS and email notification with this information approximately one month before examinations begin."
      },
      {
        question: "What identification do I need to bring on examination day?",
        answer: "You must bring your official GCE examination card (generated after registration) and a valid national ID or passport. Both documents will be verified before you're allowed to enter the examination hall."
      },
      {
        question: "What happens if I miss an examination?",
        answer: "Missing an examination without prior approved absence will result in an automatic fail for that subject. In cases of documented medical emergencies or extraordinary circumstances, you must contact the examination board within 24 hours of the missed exam."
      }
    ]
  },
  {
    category: "Results & Grading",
    questions: [
      {
        question: "How is the O Level grading system structured?",
        answer: "The O Level uses a 9-1 grading scale where 9 is the highest grade and 1 is the lowest passing grade. Each subject is graded individually, and grade boundaries are determined based on statistical analysis of performance across all candidates."
      },
      {
        question: "How is the A Level grading system structured?",
        answer: "A Level uses an A*-E grading system (A*, A, B, C, D, E) where A* is the highest and E is the lowest passing grade. These grades correspond to UCAS points for university admissions. Grading incorporates both theoretical and practical components for applicable subjects."
      },
      {
        question: "When and how will results be published?",
        answer: "Results are typically published 2-3 months after the examination period ends. You can access your results through your student account on this portal, via SMS notification, or by checking at your examination center. Results are secured with blockchain technology to prevent tampering."
      },
      {
        question: "Can I request a remark if I'm not satisfied with my results?",
        answer: "Yes, you can request a remark within 30 days of results publication. This service incurs a fee which is refundable if your grade changes. Submit your request through your account dashboard or at your examination center."
      }
    ]
  },
  {
    category: "System Access & Support",
    questions: [
      {
        question: "How do I access the system in areas with poor internet connectivity?",
        answer: "Our system has offline capabilities for areas with intermittent internet. You can download the mobile app which works in low-bandwidth environments and synchronizes when connectivity improves. Critical functions like registration confirmations and results are also available via SMS."
      },
      {
        question: "Is the system available in both English and French?",
        answer: "Yes, the entire system supports both English and French. You can toggle between languages using the language selector in the top-right corner of any page. All documentation, help resources, and examinations are available in both languages."
      },
      {
        question: "How do I get help if I encounter problems?",
        answer: "Support is available through multiple channels: the help center on this portal, email support, phone helpline, and in-person support at regional education offices. During critical periods like registration deadlines and results day, we offer 24/7 support."
      },
      {
        question: "How do I recover my account if I forget my password?",
        answer: "Use the 'Forgot Password' link on the login page. Verification will be sent to your registered email or phone number. For security reasons, significant changes to your account may require additional verification from your school coordinator."
      }
    ]
  },
  {
    category: "Certificates & Verification",
    questions: [
      {
        question: "How do I obtain my certificate after passing?",
        answer: "Digital certificates are automatically available in your account after results are published. Physical certificates can be collected from your examination center approximately 2-3 months after results publication. You can also request direct delivery for an additional fee."
      },
      {
        question: "How can universities or employers verify my results?",
        answer: "Each certificate includes a unique QR code and verification ID. Institutions can verify authenticity through our public verification portal without needing access to your personal account. This service is free and available 24/7."
      },
      {
        question: "What if my certificate is damaged or lost?",
        answer: "You can request a replacement certificate through your account or at regional education offices. This requires identity verification and payment of a replacement fee. Digital certificates are always available in your account for download."
      }
    ]
  }
];

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
    setActiveQuestion(null);
  };

  const toggleQuestion = (question: string) => {
    setActiveQuestion(activeQuestion === question ? null : question);
  };

  const filteredFaqs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      <Head>
        <title>FAQ - GCE Examination System</title>
        <meta name="description" content="Frequently Asked Questions about the Cameroon GCE Examination System" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about the Automated GCE Results Examination and Grading System
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto mb-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQ..."
              className="w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-l-md">
              English
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-r-md">
              Français
            </button>
          </div>
        </div>

        {/* FAQ accordion */}
        <div className="space-y-6">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category) => (
              <div key={category.category} className="border rounded-lg overflow-hidden">
                <button
                  className={`w-full flex justify-between items-center p-4 text-left text-lg font-medium ${
                    activeCategory === category.category ? 'bg-primary text-white' : 'bg-gray-50 text-gray-800'
                  }`}
                  onClick={() => toggleCategory(category.category)}
                >
                  <span>{category.category}</span>
                  {activeCategory === category.category ? (
                    <FaChevronUp className="h-5 w-5" />
                  ) : (
                    <FaChevronDown className="h-5 w-5" />
                  )}
                </button>

                {activeCategory === category.category && (
                  <div className="divide-y divide-gray-200">
                    {category.questions.map((faq) => (
                      <div key={faq.question} className="bg-white">
                        <button
                          className="w-full flex justify-between items-center p-4 text-left text-gray-800 hover:bg-gray-50 focus:outline-none"
                          onClick={() => toggleQuestion(faq.question)}
                        >
                          <span className="font-medium">{faq.question}</span>
                          {activeQuestion === faq.question ? (
                            <FaChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <FaChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </button>

                        {activeQuestion === faq.question && (
                          <div className="p-4 pt-0 text-gray-600 bg-gray-50">
                            <p className="pt-2 pb-3">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No FAQ matches your search. Please try different keywords.</p>
            </div>
          )}
        </div>

        {/* Contact section */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Couldn't find what you're looking for?</h2>
          <p className="mb-6">Our support team is available to help you with any specific questions about the GCE examination system.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p>Call our helpline:</p>
              <p className="text-primary font-medium">+237 xxx xxx xxx</p>
              <p className="text-sm text-gray-500 mt-1">Available Mon-Fri, 8am-5pm</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p>Send us your query:</p>
              <p className="text-primary font-medium">support@gcecameroon.org</p>
              <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
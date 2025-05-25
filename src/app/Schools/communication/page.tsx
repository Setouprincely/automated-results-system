'use client';

import { useState } from 'react';
import SchoolsLayout from '@/components/layouts/SchoolsLayout';
import {
  MessageCircle,
  Send,
  File,
  Bell,
  Search,
  Paperclip,
  Download,
  ArrowLeft,
  ChevronDown,
  Filter
} from 'lucide-react';

// Mock data for demonstration
const mockMessages = [
  {
    id: 1,
    sender: 'GCE Board',
    recipient: 'All Schools',
    subject: 'Important: 2025 Examination Schedule Updates',
    date: '2025-05-10T14:30:00',
    content: 'Dear School Administrators and Teachers, Please note that the 2025 GCE examination schedule has been updated. The O Level Mathematics examination has been rescheduled from June 15 to June 18, 2025. Please ensure all candidates are informed of this change.',
    read: true,
    category: 'announcement',
    hasAttachment: true,
    attachments: [{name: 'Updated_Schedule_2025.pdf', size: '1.2MB'}]
  },
  {
    id: 2,
    sender: 'GCE Board',
    recipient: 'All Schools',
    subject: 'Registration Deadline Reminder',
    date: '2025-05-05T09:15:00',
    content: 'This is a reminder that the registration deadline for the 2025 GCE examination is May 30, 2025. Please ensure all candidate information is submitted before this date to avoid late registration penalties.',
    read: true,
    category: 'reminder',
    hasAttachment: false,
    attachments: []
  },
  {
    id: 3,
    sender: 'Your School',
    recipient: 'GCE Board',
    subject: 'Query: Special Accommodation Request',
    date: '2025-05-02T11:22:00',
    content: 'We have a candidate who requires special accommodations due to a physical disability. Could you please provide guidelines on how to formally request these accommodations and what documentation is required?',
    read: true,
    category: 'query',
    hasAttachment: false,
    attachments: []
  },
  {
    id: 4,
    sender: 'GCE Board',
    recipient: 'Your School',
    subject: 'Re: Special Accommodation Request',
    date: '2025-05-03T14:08:00',
    content: 'Thank you for your query. To request special accommodations, please submit the following: 1) A formal letter from the school principal, 2) Medical documentation supporting the request, 3) The specific accommodations required. Please submit these documents through this portal using the attachment option.',
    read: false,
    category: 'response',
    hasAttachment: true,
    attachments: [{name: 'Special_Accommodations_Form.docx', size: '405KB'}]
  },
  {
    id: 5,
    sender: 'GCE Board',
    recipient: 'All Schools',
    subject: 'New Portal Features Released',
    date: '2025-04-28T10:00:00',
    content: 'We are pleased to announce new features in the communication portal. You can now filter messages by category, download message history, and receive real-time notifications. Please see the attached guide for more details.',
    read: false,
    category: 'announcement',
    hasAttachment: true,
    attachments: [{name: 'Portal_Updates_Guide.pdf', size: '2.1MB'}]
  }
];

interface Message {
  id: number;
  sender: string;
  recipient: string;
  subject: string;
  date: string;
  content: string;
  read: boolean;
  category: string;
  hasAttachment: boolean;
  attachments: {name: string, size: string}[];
}

export default function CommunicationPortal() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [composeMode, setComposeMode] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    attachments: [] as File[]
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Messages' },
    { value: 'unread', label: 'Unread' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'query', label: 'Queries' },
    { value: 'response', label: 'Responses' }
  ];

  // Filter messages based on search term and selected filter
  const filteredMessages = messages.filter(message => {
    // Search filter
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    let matchesFilter = true;
    if (selectedFilter === 'unread') {
      matchesFilter = !message.read;
    } else if (selectedFilter !== 'all') {
      matchesFilter = message.category === selectedFilter;
    }

    return matchesSearch && matchesFilter;
  });

  // Sort messages by date (most recent first)
  const sortedMessages = [...filteredMessages].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if it was unread
    if (!message.read) {
      const updatedMessages = messages.map(m =>
        m.id === message.id ? {...m, read: true} : m
      );
      setMessages(updatedMessages);
    }
  };

  const handleComposeClick = () => {
    setSelectedMessage(null);
    setComposeMode(true);
  };

  const handleSendMessage = () => {
    // In a real application, this would send the message to an API
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'Your School',
      recipient: 'GCE Board',
      subject: newMessage.subject,
      date: new Date().toISOString(),
      content: newMessage.content,
      read: true,
      category: 'query',
      hasAttachment: newMessage.attachments.length > 0,
      attachments: newMessage.attachments.map(file => ({
        name: file.name,
        size: `${Math.round(file.size / 1024)}KB`
      }))
    };

    setMessages([newMsg, ...messages]);
    setNewMessage({ subject: '', content: '', attachments: [] });
    setComposeMode(false);
    setSelectedMessage(newMsg); // Show the sent message
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewMessage({
        ...newMessage,
        attachments: [...newMessage.attachments, ...filesArray]
      });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const updatedAttachments = [...newMessage.attachments];
    updatedAttachments.splice(index, 1);
    setNewMessage({
      ...newMessage,
      attachments: updatedAttachments
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleBackClick = () => {
    if (composeMode) {
      setComposeMode(false);
    } else {
      setSelectedMessage(null);
    }
  };

  const getUnreadCount = () => {
    return messages.filter(m => !m.read).length;
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const selectFilter = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterMenu(false);
  };

  return (
    <SchoolsLayout>
      <div className="flex flex-col h-screen max-h-screen bg-gray-50">
        <div className="flex items-center justify-between bg-blue-700 text-white p-4">
          <h1 className="text-xl font-bold">Communication Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 cursor-pointer" />
              {getUnreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getUnreadCount()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Message List Panel */}
          <div className={`w-1/3 border-r border-gray-200 flex flex-col ${(selectedMessage || composeMode) ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center mb-4 space-x-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
                <div className="relative">
                  <button
                    className="flex items-center space-x-1 py-2 px-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                    onClick={toggleFilterMenu}
                  >
                    <Filter className="w-4 h-4 text-gray-600" />
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {filterOptions.map(option => (
                          <button
                            key={option.value}
                            className={`block w-full text-left px-4 py-2 text-sm ${selectedFilter === option.value ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => selectFilter(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2"
                onClick={handleComposeClick}
              >
                <MessageCircle className="w-5 h-5" />
                <span>New Message</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sortedMessages.length > 0 ? (
                sortedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${!message.read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-sm font-medium ${!message.read ? 'font-bold text-blue-800' : 'text-gray-900'}`}>
                          {message.sender}
                        </h3>
                        <span className="text-xs text-gray-500">{formatDate(message.date).split(',')[0]}</span>
                      </div>
                      <h4 className={`text-sm mt-1 ${!message.read ? 'font-semibold' : ''}`}>
                        {message.subject}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {message.content}
                      </p>
                      {message.hasAttachment && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Paperclip className="w-3 h-3 mr-1" />
                          <span>{message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryBadgeColor(message.category)}`}>
                          {capitalizeFirstLetter(message.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p>No messages found</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Content or Compose Panel */}
          <div className={`${(selectedMessage || composeMode) ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
            {!selectedMessage && !composeMode ? (
              <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Message Selected</h3>
                  <p className="text-gray-500 mb-4">Select a message from the list to view its contents or compose a new message</p>
                  <button
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
                    onClick={handleComposeClick}
                  >
                    Compose New Message
                  </button>
                </div>
              </div>
            ) : composeMode ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center bg-white p-4 border-b border-gray-200">
                  <button
                    className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
                    onClick={handleBackClick}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-medium">New Message</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Recipient</label>
                    <input
                      type="text"
                      value="GCE Board"
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subject..."
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your message here..."
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Attachments</label>
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <Paperclip className="w-4 h-4 mr-2 text-gray-600" />
                          <span>Add Files</span>
                        </div>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {newMessage.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {newMessage.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center">
                              <File className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({Math.round(file.size / 1024)}KB)</span>
                            </div>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end space-x-3">
                    <button
                      className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                      onClick={() => setComposeMode(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center"
                      onClick={handleSendMessage}
                      disabled={!newMessage.subject || !newMessage.content}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedMessage && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center bg-white p-4 border-b border-gray-200">
                  <button
                    className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
                    onClick={handleBackClick}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-medium truncate">{selectedMessage.subject}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{selectedMessage.subject}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          From: <span className="font-medium">{selectedMessage.sender}</span>
                        </p>
                        <p className="text-gray-600 text-sm">
                          To: <span className="font-medium">{selectedMessage.recipient}</span>
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {formatDate(selectedMessage.date)}
                        </p>
                      </div>
                      <span className={`inline-block px-3 py-1 text-sm rounded-full ${getCategoryBadgeColor(selectedMessage.category)}`}>
                        {capitalizeFirstLetter(selectedMessage.category)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="prose max-w-none text-gray-800">
                        {selectedMessage.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    {selectedMessage.hasAttachment && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-700 mb-3">Attachments ({selectedMessage.attachments.length})</h4>
                        <div className="space-y-2">
                          {selectedMessage.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center">
                                <File className="w-5 h-5 mr-3 text-gray-600" />
                                <div>
                                  <p className="font-medium text-sm">{attachment.name}</p>
                                  <p className="text-gray-500 text-xs">{attachment.size}</p>
                                </div>
                              </div>
                              <button className="text-blue-600 hover:text-blue-800 flex items-center">
                                <Download className="w-4 h-4 mr-1" />
                                <span>Download</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between">
                    <button
                      className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center"
                      onClick={handleComposeClick}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      New Message
                    </button>
                    <button
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center"
                      onClick={() => {
                        setNewMessage({
                          subject: `Re: ${selectedMessage.subject}`,
                          content: '',
                          attachments: []
                        });
                        setComposeMode(true);
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SchoolsLayout>
  );
}

// Helper functions
function getCategoryBadgeColor(category: string): string {
  switch (category) {
    case 'announcement':
      return 'bg-blue-100 text-blue-800';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-800';
    case 'query':
      return 'bg-purple-100 text-purple-800';
    case 'response':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
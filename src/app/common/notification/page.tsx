"use client";

import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Bell, Check, Filter, Trash2, X } from 'lucide-react';

// Define notification types with their respective styling
type NotificationType = 'SYSTEM' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'INFO' | 'EXAM' | 'REGISTRATION' | 'RESULTS';

const NOTIFICATION_TYPES: Record<NotificationType, { icon: string; color: string }> = {
  SYSTEM: { icon: 'Bell', color: 'bg-blue-100 text-blue-800' },
  WARNING: { icon: 'AlertTriangle', color: 'bg-yellow-100 text-yellow-800' },
  ERROR: { icon: 'AlertCircle', color: 'bg-red-100 text-red-800' },
  SUCCESS: { icon: 'CheckCircle', color: 'bg-green-100 text-green-800' },
  INFO: { icon: 'Info', color: 'bg-purple-100 text-purple-800' },
  EXAM: { icon: 'FileText', color: 'bg-indigo-100 text-indigo-800' },
  REGISTRATION: { icon: 'UserPlus', color: 'bg-pink-100 text-pink-800' },
  RESULTS: { icon: 'Award', color: 'bg-emerald-100 text-emerald-800' }
};

// Mock notification data - This would come from your API in a real application
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'SYSTEM',
    title: 'System Maintenance',
    message: 'The system will undergo maintenance on Saturday from 2:00 AM to 4:00 AM.',
    date: '2025-05-18T15:30:00',
    read: false,
    actionLink: null
  },
  {
    id: 2,
    type: 'EXAM',
    title: 'New Scripts Available',
    message: 'You have been assigned 25 new scripts for Math O Level to mark.',
    date: '2025-05-17T09:45:00',
    read: true,
    actionLink: '/examination/marking'
  },
  {
    id: 3,
    type: 'RESULTS',
    title: 'Results Ready for Review',
    message: 'The preliminary results for A Level Chemistry are ready for your review.',
    date: '2025-05-16T14:20:00',
    read: false,
    actionLink: '/results/review'
  },
  {
    id: 4,
    type: 'REGISTRATION',
    title: 'Registration Deadline Approaching',
    message: 'Reminder: O Level registration deadline is May 25, 2025.',
    date: '2025-05-15T11:10:00',
    read: false,
    actionLink: '/registration'
  },
  {
    id: 5,
    type: 'WARNING',
    title: 'Incomplete Profile',
    message: 'Please complete your examiner profile to continue with the marking process.',
    date: '2025-05-14T16:05:00',
    read: true,
    actionLink: '/profile'
  }
];

// Define notification interface
interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionLink: string | null;
}

// Main component
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Simulate API call to fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      // In a real application, this would be an API call
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 800);
    };

    fetchNotifications();
  }, []);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !notification.read;
    return notification.type === filter;
  });

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // Delete notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Bell className="h-6 w-6 mr-2 text-blue-600" />
            <h1 className="text-2xl font-bold">Notification Center</h1>
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge className="ml-2 bg-red-500">
                {notifications.filter(n => !n.read).length} New
              </Badge>
            )}
          </div>

          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  {filter === 'ALL' ? 'All Notifications' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('ALL')}>All Notifications</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('UNREAD')}>Unread</DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.keys(NOTIFICATION_TYPES).map(type => (
                  <DropdownMenuItem key={type} onClick={() => setFilter(type)}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.read)}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>

            <Button
              variant="outline"
              className="text-red-500 hover:text-red-700"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Bell className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">No Notifications</h3>
              <p>You're all caught up! Check back later for updates.</p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Filter className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">No Matching Notifications</h3>
              <p>No notifications match your current filter.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setFilter('ALL')}
              >
                View All Notifications
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${NOTIFICATION_TYPES[notification.type].color}`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        {!notification.read && (
                          <Badge className="ml-2 bg-blue-500">New</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>{formatRelativeTime(notification.date)}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{notification.type.toLowerCase()}</span>
                      </div>
                      {notification.actionLink && (
                        <Button
                          variant="link"
                          className="mt-2 pl-0 text-blue-600"
                          onClick={() => {
                            markAsRead(notification.id);
                            // In a real app, you would use router.push here
                            console.log(`Navigate to: ${notification.actionLink}`);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Mark as read"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination component would go here for real applications with many notifications */}
        {notifications.length > 5 && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" className="mr-2">Previous</Button>
            <Button variant="default" className="bg-blue-600 text-white">1</Button>
            <Button variant="outline" className="ml-2">Next</Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationCenter;
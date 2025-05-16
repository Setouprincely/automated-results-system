// pages/admin/system-configuration.js
"use client";
import { useState } from 'react';
import { 
  Save, 
  Settings, 
  Globe, 
  Shield,
  Database,
  Mail,
  MessageSquare,
  Bell
} from 'lucide-react';
import Head from 'next/head';
import Layout from '@/components/layouts/layout';

export default function SystemConfiguration() {
  const [activeTab, setActiveTab] = useState('general');
  
  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'localization', label: 'Localization', icon: <Globe size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'database', label: 'Database', icon: <Database size={18} /> },
    { id: 'email', label: 'Email', icon: <Mail size={18} /> },
    { id: 'sms', label: 'SMS Gateway', icon: <MessageSquare size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];
  
  return (
    <Layout>
      <Head>
        <title>System Configuration | GCE Admin</title>
      </Head>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'localization' && <LocalizationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'database' && <DatabaseSettings />}
            {activeTab === 'email' && <EmailSettings />}
            {activeTab === 'sms' && <SMSSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="GCE Results Examination System"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Administrator Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="admin@gce.cm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Timezone
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Africa/Douala">Africa/Douala (UTC+01:00)</option>
            <option value="UTC">UTC</option>
            <option value="Africa/Lagos">Africa/Lagos (UTC+01:00)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maintenance Mode
          </label>
          <div className="flex items-center">
            <label className="inline-flex items-center mr-4">
              <input type="radio" name="maintenance" value="off" className="text-blue-600" defaultChecked />
              <span className="ml-2">Off</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="maintenance" value="on" className="text-blue-600" />
              <span className="ml-2">On</span>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maintenance Message
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          defaultValue="The system is currently undergoing scheduled maintenance. Please check back later."
        ></textarea>
      </div>
    </div>
  );
}

function LocalizationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Localization Settings</h2>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Language
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Format
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Available Languages</label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" id="lang-en" className="text-blue-600" defaultChecked />
            <label htmlFor="lang-en" className="ml-2">English</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="lang-fr" className="text-blue-600" defaultChecked />
            <label htmlFor="lang-fr" className="ml-2">French</label>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password Policy
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="standard">Standard (8+ chars, 1 uppercase, 1 number)</option>
            <option value="strong">Strong (10+ chars, uppercase, number, symbol)</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="30"
            min="5"
            max="120"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Failed Login Attempts (before lockout)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="5"
            min="3"
            max="10"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Lockout Duration (minutes)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="15"
            min="5"
            max="60"
          />
        </div>
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Two-Factor Authentication</label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" id="2fa-admin" className="text-blue-600" defaultChecked />
            <label htmlFor="2fa-admin" className="ml-2">Required for Administrators</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="2fa-examiners" className="text-blue-600" />
            <label htmlFor="2fa-examiners" className="ml-2">Required for Examiners</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="2fa-schools" className="text-blue-600" />
            <label htmlFor="2fa-schools" className="ml-2">Required for School Officials</label>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Database Settings</h2>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Database Type
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="postgresql">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Host
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="localhost"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Port
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="5432"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Database Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="gce_results"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="gce_admin"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="********"
          />
        </div>
      </div>
      
      <div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
          Test Connection
        </button>
      </div>
    </div>
  );
}

function EmailSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Email Settings</h2>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Server
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="smtp.example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Port
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="587"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Encryption
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="noreply@gce.cm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="gce_mailer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="********"
          />
        </div>
      </div>
      
      <div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
          Send Test Email
        </button>
      </div>
    </div>
  );
}

function SMSSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">SMS Gateway Settings</h2>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMS Provider
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="twilio">Twilio</option>
            <option value="nexmo">Nexmo/Vonage</option>
            <option value="africas_talking">Africa's Talking</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="sk_****************************************"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Secret
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="****************************************"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Number/ID
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="GCE-BOARD"
          />
        </div>
      </div>
      
      <div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
          Send Test SMS
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
      
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Email Notifications</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div>
              <p className="font-medium">Registration Confirmation</p>
              <p className="text-sm text-gray-500">Send email when new candidate registers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div>
              <p className="font-medium">Results Publication</p>
              <p className="text-sm text-gray-500">Send email when results are published</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div>
              <p className="font-medium">System Alerts</p>
              <p className="text-sm text-gray-500">Send email for system warnings and errors</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        
        <h3 className="text-md font-medium text-gray-800 mt-6">SMS Notifications</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div>
              <p className="font-medium">Results Publication</p>
              <p className="text-sm text-gray-500">Send SMS when results are published</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div>
              <p className="font-medium">Registration Confirmation</p>
              <p className="text-sm text-gray-500">Send SMS when new candidate registers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
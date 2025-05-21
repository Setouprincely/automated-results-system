'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layouts/layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertCircle, Edit, Plus, Send, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Types
type NotificationType = 'sms' | 'email';
type EventType = 'results_published' | 'registration_confirmed' | 'payment_received' | 'exam_schedule';
type TemplateStatus = 'active' | 'draft' | 'archived';

interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  event: EventType;
  language: 'english' | 'french' | 'bilingual';
  subject?: string;
  content: string;
  variables: string[];
  status: TemplateStatus;
  lastUpdated: string;
}

interface ScheduleConfig {
  enabled: boolean;
  sendTime: 'immediate' | 'scheduled';
  scheduledTime?: string;
  throttleRate?: number;
  retryAttempts: number;
}

interface SMSConfig {
  provider: string;
  apiKey: string;
  senderId: string;
  defaultCountryCode: string;
  characterLimit: number;
  deliveryReports: boolean;
}

interface EmailConfig {
  provider: string;
  apiKey: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  enableTracking: boolean;
}

// Mock data
const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'O Level Results Available',
    type: 'sms',
    event: 'results_published',
    language: 'english',
    content: 'Dear {{name}}, your GCE O Level results are now available. Visit portal.gce.cm with your ID {{studentId}} to check your results. Congratulations!',
    variables: ['name', 'studentId'],
    status: 'active',
    lastUpdated: '2025-05-12'
  },
  {
    id: '2',
    name: 'A Level Results Notification',
    type: 'email',
    event: 'results_published',
    language: 'bilingual',
    subject: 'GCE A Level Results Now Available / Résultats du GCE A Level maintenant disponibles',
    content: `Dear {{name}},

We are pleased to inform you that your GCE A Level results are now available.

Student ID: {{studentId}}
Examination Session: {{session}}

To view your results, please log in to the official GCE portal at portal.gce.cm using your credentials.

Best regards,
GCE Board Cameroon

---

Cher/Chère {{name}},

Nous avons le plaisir de vous informer que vos résultats du GCE A Level sont maintenant disponibles.

ID d'étudiant: {{studentId}}
Session d'examen: {{session}}

Pour consulter vos résultats, veuillez vous connecter au portail officiel du GCE à portal.gce.cm en utilisant vos identifiants.

Cordialement,
Conseil du GCE Cameroun`,
    variables: ['name', 'studentId', 'session'],
    status: 'active',
    lastUpdated: '2025-05-15'
  },
  {
    id: '3',
    name: 'Registration Confirmation',
    type: 'sms',
    event: 'registration_confirmed',
    language: 'french',
    content: 'Cher(e) {{name}}, votre inscription au GCE est confirmée. Votre ID est {{studentId}}. Les examens commenceront le {{examDate}}.',
    variables: ['name', 'studentId', 'examDate'],
    status: 'draft',
    lastUpdated: '2025-05-02'
  },
  {
    id: '4',
    name: 'Payment Receipt',
    type: 'email',
    event: 'payment_received',
    language: 'english',
    subject: 'GCE Registration Payment Receipt',
    content: `Dear {{name}},

Thank you for your payment for the GCE examinations.

Payment Details:
- Receipt Number: {{receiptNo}}
- Amount Paid: {{amount}} FCFA
- Payment Date: {{paymentDate}}
- Registration ID: {{registrationId}}

Please keep this receipt for future reference.

Best regards,
GCE Board Cameroon`,
    variables: ['name', 'receiptNo', 'amount', 'paymentDate', 'registrationId'],
    status: 'active',
    lastUpdated: '2025-05-10'
  }
];

const defaultSmsConfig: SMSConfig = {
  provider: 'MTN Cameroon',
  apiKey: '••••••••••••••••',
  senderId: 'GCEBOARD',
  defaultCountryCode: '+237',
  characterLimit: 160,
  deliveryReports: true
};

const defaultEmailConfig: EmailConfig = {
  provider: 'SendGrid',
  apiKey: '••••••••••••••••',
  senderName: 'GCE Board Cameroon',
  senderEmail: 'notifications@gce.cm',
  replyToEmail: 'support@gce.cm',
  enableTracking: true
};

const defaultScheduleConfig: ScheduleConfig = {
  enabled: true,
  sendTime: 'immediate',
  throttleRate: 100,
  retryAttempts: 3
};

export default function NotificationConfigPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [smsConfig, setSmsConfig] = useState<SMSConfig>(defaultSmsConfig);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(defaultEmailConfig);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(defaultScheduleConfig);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [testingSending, setTestingSending] = useState(false);
  const [selectedTemplateForTest, setSelectedTemplateForTest] = useState<string>('');
  const [testRecipient, setTestRecipient] = useState('');

  const templateForm = useForm<NotificationTemplate>({
    defaultValues: {
      id: '',
      name: '',
      type: 'sms',
      event: 'results_published',
      language: 'english',
      subject: '',
      content: '',
      variables: [],
      status: 'draft',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  });

  const smsConfigForm = useForm<SMSConfig>({
    defaultValues: smsConfig
  });

  const emailConfigForm = useForm<EmailConfig>({
    defaultValues: emailConfig
  });

  const scheduleConfigForm = useForm<ScheduleConfig>({
    defaultValues: scheduleConfig
  });

  useEffect(() => {
    if (editingTemplate) {
      templateForm.reset(editingTemplate);
    } else if (isCreatingTemplate) {
      templateForm.reset({
        id: `template-${Date.now()}`,
        name: '',
        type: 'sms',
        event: 'results_published',
        language: 'english',
        subject: '',
        content: '',
        variables: [],
        status: 'draft',
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingTemplate, isCreatingTemplate, templateForm]);

  useEffect(() => {
    smsConfigForm.reset(smsConfig);
  }, [smsConfig, smsConfigForm]);

  useEffect(() => {
    emailConfigForm.reset(emailConfig);
  }, [emailConfig, emailConfigForm]);

  useEffect(() => {
    scheduleConfigForm.reset(scheduleConfig);
  }, [scheduleConfig, scheduleConfigForm]);

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setIsCreatingTemplate(false);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setIsCreatingTemplate(true);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setIsCreatingTemplate(false);
    templateForm.reset();
  };

  const handleSubmitTemplate = (data: NotificationTemplate) => {
    const updatedData = {
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t =>
        t.id === updatedData.id ? updatedData : t
      ));
    } else {
      // Add new template
      setTemplates([...templates, updatedData]);
    }

    setEditingTemplate(null);
    setIsCreatingTemplate(false);
    templateForm.reset();
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleSaveSmsConfig = (data: SMSConfig) => {
    setSavingStatus('saving');
    setTimeout(() => {
      setSmsConfig(data);
      setSavingStatus('success');
      setTimeout(() => setSavingStatus('idle'), 2000);
    }, 1000);
  };

  const handleSaveEmailConfig = (data: EmailConfig) => {
    setSavingStatus('saving');
    setTimeout(() => {
      setEmailConfig(data);
      setSavingStatus('success');
      setTimeout(() => setSavingStatus('idle'), 2000);
    }, 1000);
  };

  const handleSaveScheduleConfig = (data: ScheduleConfig) => {
    setSavingStatus('saving');
    setTimeout(() => {
      setScheduleConfig(data);
      setSavingStatus('success');
      setTimeout(() => setSavingStatus('idle'), 2000);
    }, 1000);
  };

  const handleTestSend = () => {
    if (!testRecipient || !selectedTemplateForTest) return;

    setTestingSending(true);
    // Simulate API call
    setTimeout(() => {
      setTestingSending(false);
      // Show success message
      setSavingStatus('success');
      setTimeout(() => {
        setTestDialogOpen(false);
        setTestRecipient('');
        setSelectedTemplateForTest('');
        setSavingStatus('idle');
      }, 2000);
    }, 1500);
  };

  const openTestDialog = (templateId: string) => {
    setSelectedTemplateForTest(templateId);
    setTestDialogOpen(true);
  };

  const getStatusBadge = (status: TemplateStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'sms':
        return <Badge className="bg-blue-500">SMS</Badge>;
      case 'email':
        return <Badge className="bg-purple-500">Email</Badge>;
    }
  };

  const eventOptions = [
    { value: 'results_published', label: 'Results Published' },
    { value: 'registration_confirmed', label: 'Registration Confirmed' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'exam_schedule', label: 'Exam Schedule' },
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'french', label: 'French' },
    { value: 'bilingual', label: 'Bilingual' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ];

  const extractVariablesFromContent = (content: string) => {
    const regex = /{{([^}]+)}}/g;
    const matches = content.match(regex) || [];
    return matches.map(match => match.replace(/{{|}}/g, ''));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notification Configuration</h1>
          <div className="flex space-x-2">
            {savingStatus === 'saving' && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Saving changes...
              </Badge>
            )}
            {savingStatus === 'success' && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Changes saved!
              </Badge>
            )}
            {savingStatus === 'error' && (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                Error saving changes
              </Badge>
            )}
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Management System</CardTitle>
            <CardDescription>
              Configure and manage SMS and email notifications for the GCE Results system. Create templates, set delivery rules, and test notifications.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="sms">SMS Configuration</TabsTrigger>
            <TabsTrigger value="email">Email Configuration</TabsTrigger>
            <TabsTrigger value="schedule">Delivery Settings</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {!editingTemplate && !isCreatingTemplate ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Notification Templates</h2>
                  <Button onClick={handleCreateTemplate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Template
                  </Button>
                </div>

                <Table>
                  <TableCaption>List of notification templates</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{getTypeBadge(template.type)}</TableCell>
                        <TableCell>
                          {eventOptions.find(e => e.value === template.event)?.label}
                        </TableCell>
                        <TableCell className="capitalize">{template.language}</TableCell>
                        <TableCell>{getStatusBadge(template.status)}</TableCell>
                        <TableCell>{template.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTestDialog(template.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isCreatingTemplate ? 'Create New Template' : 'Edit Template'}
                  </CardTitle>
                  <CardDescription>
                    {isCreatingTemplate
                      ? 'Create a new notification template for SMS or email communications.'
                      : 'Modify an existing notification template.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...templateForm}>
                    <form onSubmit={templateForm.handleSubmit(handleSubmitTemplate)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={templateForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Template Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Results Notification" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={templateForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={templateForm.control}
                          name="event"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Trigger</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select event" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {eventOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={templateForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languageOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {templateForm.watch('type') === 'email' && (
                        <FormField
                          control={templateForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Subject</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Your GCE Results Are Available" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={templateForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Content</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter notification content here. Use {{variable}} syntax for dynamic content."
                                className="h-40 font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              Use placeholders like {'{{'}name{'}}'}  or {'{{'}studentId{'}}'}  for personalization.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={templateForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Only active templates will be sent when triggered.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <h3 className="text-sm font-medium mb-2">Template Variables</h3>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                          {extractVariablesFromContent(templateForm.watch('content')).map((variable, index) => (
                            <Badge key={index} variant="secondary">
                              {variable}
                            </Badge>
                          ))}
                          {extractVariablesFromContent(templateForm.watch('content')).length === 0 && (
                            <span className="text-sm text-gray-500">No variables detected</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {isCreatingTemplate ? 'Create Template' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SMS Configuration Tab */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle>SMS Service Configuration</CardTitle>
                <CardDescription>
                  Configure SMS gateway settings for delivering notifications to candidates and stakeholders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...smsConfigForm}>
                  <form onSubmit={smsConfigForm.handleSubmit(handleSaveSmsConfig)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={smsConfigForm.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMS Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MTN Cameroon">MTN Cameroon</SelectItem>
                                <SelectItem value="Orange Cameroon">Orange Cameroon</SelectItem>
                                <SelectItem value="Nexmo">Nexmo</SelectItem>
                                <SelectItem value="Twilio">Twilio</SelectItem>
                                <SelectItem value="Africa's Talking">Africa's Talking</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={smsConfigForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter API key"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={smsConfigForm.control}
                        name="senderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., GCEBOARD" />
                            </FormControl>
                            <FormDescription>
                              This will appear as the sender of SMS messages.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={smsConfigForm.control}
                        name="defaultCountryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Country Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., +237" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={smsConfigForm.control}
                        name="characterLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Character Limit</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Standard SMS has 160 character limit.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={smsConfigForm.control}
                        name="deliveryReports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Delivery Reports
                              </FormLabel>
                              <FormDescription>
                                Receive status updates on message delivery.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Ensure you have sufficient credit with your SMS provider before sending bulk notifications.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end">
                      <Button type="submit">
                        Save SMS Configuration
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Configuration Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Service Configuration</CardTitle>
                <CardDescription>
                  Configure email service settings for delivering notifications to candidates and stakeholders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailConfigForm}>
                  <form onSubmit={emailConfigForm.handleSubmit(handleSaveEmailConfig)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={emailConfigForm.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SendGrid">SendGrid</SelectItem>
                                <SelectItem value="Mailgun">Mailgun</SelectItem>
                                <SelectItem value="Amazon SES">Amazon SES</SelectItem>
                                <SelectItem value="SMTP">Custom SMTP</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailConfigForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter API key"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={emailConfigForm.control}
                        name="senderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., GCE Board Cameroon" />
                            </FormControl>
                            <FormDescription>
                              This will appear as the sender name in email messages.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailConfigForm.control}
                        name="senderEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., notifications@gce.cm" type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={emailConfigForm.control}
                        name="replyToEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reply-To Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., support@gce.cm" type="email" />
                            </FormControl>
                            <FormDescription>
                              Email address that will receive replies.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailConfigForm.control}
                        name="enableTracking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Email Tracking
                              </FormLabel>
                              <FormDescription>
                                Track email opens and link clicks.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Make sure your email provider is properly configured to avoid deliverability issues.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end">
                      <Button type="submit">
                        Save Email Configuration
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Settings Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Notification Delivery Settings</CardTitle>
                <CardDescription>
                  Configure when and how notifications are delivered to recipients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...scheduleConfigForm}>
                  <form onSubmit={scheduleConfigForm.handleSubmit(handleSaveScheduleConfig)} className="space-y-6">
                    <FormField
                      control={scheduleConfigForm.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enable Automated Notifications
                            </FormLabel>
                            <FormDescription>
                              When disabled, notifications will not be sent automatically.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={scheduleConfigForm.control}
                        name="sendTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Timing</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timing" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose when notifications should be sent.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {scheduleConfigForm.watch('sendTime') === 'scheduled' && (
                        <FormField
                          control={scheduleConfigForm.control}
                          name="scheduledTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Scheduled Time</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="time"
                                  placeholder="Select time"
                                />
                              </FormControl>
                              <FormDescription>
                                Time of day to send notifications.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={scheduleConfigForm.control}
                        name="throttleRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Throttle Rate (per minute)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum number of notifications to send per minute.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={scheduleConfigForm.control}
                        name="retryAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retry Attempts</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of times to retry failed notifications.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                        High throttle rates may lead to rate limiting by SMS or email providers.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end">
                      <Button type="submit">
                        Save Delivery Settings
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Test Notification Dialog */}
        <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Test Notification</DialogTitle>
              <DialogDescription>
                Send a test notification to verify your template and delivery settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="testRecipient">Recipient</Label>
                <Input
                  id="testRecipient"
                  placeholder="Enter phone number or email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  {templates.find(t => t.id === selectedTemplateForTest)?.type === 'sms'
                    ? 'Enter a phone number with country code, e.g., +237612345678'
                    : 'Enter an email address, e.g., recipient@example.com'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Selected Template</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">
                    {templates.find(t => t.id === selectedTemplateForTest)?.name || 'No template selected'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {templates.find(t => t.id === selectedTemplateForTest)?.type === 'sms'
                      ? 'SMS Template'
                      : 'Email Template'}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleTestSend}
                disabled={!testRecipient || !selectedTemplateForTest || testingSending}
              >
                {testingSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Test'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
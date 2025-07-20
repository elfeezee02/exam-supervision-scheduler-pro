import React, { useState } from 'react';
import { useESSS } from '@/context/ESSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Save, RefreshCw, Mail, Bell, Shield, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { currentUser } = useESSS();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    institutionName: 'University of Technology',
    academicYear: '2024/2025',
    defaultSupervisorsPerExam: 2,
    maxAssignmentsPerDay: 5,
    scheduleGenerationMethod: 'automatic'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    scheduleReminders: true,
    systemAlerts: true,
    reminderHours: 24
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 480,
    passwordExpiry: 90,
    requireTwoFactor: false,
    auditLogging: true
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    maintenanceMode: false
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    setGeneralSettings({
      institutionName: 'University of Technology',
      academicYear: '2024/2025',
      defaultSupervisorsPerExam: 2,
      maxAssignmentsPerDay: 5,
      scheduleGenerationMethod: 'automatic'
    });
    
    toast({
      title: "Success",
      description: "Settings reset to default values"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and options</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-gradient-primary text-white shadow-glow"
          >
            <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{currentUser?.username}</p>
              <p className="text-sm text-muted-foreground">
                Logged in as {currentUser?.role === 'admin' ? 'Administrator' : 'Supervisor'}
              </p>
            </div>
            <Badge variant="default">Active Session</Badge>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Basic system configuration and defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                value={generalSettings.institutionName}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  institutionName: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={generalSettings.academicYear}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  academicYear: e.target.value
                })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultSupervisors">Default Supervisors per Exam</Label>
              <Input
                id="defaultSupervisors"
                type="number"
                min="1"
                max="10"
                value={generalSettings.defaultSupervisorsPerExam}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  defaultSupervisorsPerExam: Number(e.target.value)
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxAssignments">Max Assignments per Day</Label>
              <Input
                id="maxAssignments"
                type="number"
                min="1"
                max="20"
                value={generalSettings.maxAssignmentsPerDay}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  maxAssignmentsPerDay: Number(e.target.value)
                })}
              />
            </div>
            <div>
              <Label htmlFor="scheduleMethod">Schedule Generation</Label>
              <Select
                value={generalSettings.scheduleGenerationMethod}
                onValueChange={(value) => setGeneralSettings({
                  ...generalSettings,
                  scheduleGenerationMethod: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure how and when to send notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setNotificationSettings({
                ...notificationSettings,
                emailNotifications: checked
              })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={notificationSettings.smsNotifications}
              onCheckedChange={(checked) => setNotificationSettings({
                ...notificationSettings,
                smsNotifications: checked
              })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="scheduleReminders">Schedule Reminders</Label>
              <p className="text-sm text-muted-foreground">Remind supervisors of upcoming duties</p>
            </div>
            <Switch
              id="scheduleReminders"
              checked={notificationSettings.scheduleReminders}
              onCheckedChange={(checked) => setNotificationSettings({
                ...notificationSettings,
                scheduleReminders: checked
              })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reminderHours">Reminder Hours Before</Label>
              <Input
                id="reminderHours"
                type="number"
                min="1"
                max="168"
                value={notificationSettings.reminderHours}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  reminderHours: Number(e.target.value)
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Security and access control configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="30"
                max="1440"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  sessionTimeout: Number(e.target.value)
                })}
              />
            </div>
            <div>
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                min="30"
                max="365"
                value={securitySettings.passwordExpiry}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  passwordExpiry: Number(e.target.value)
                })}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireTwoFactor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
            </div>
            <Switch
              id="requireTwoFactor"
              checked={securitySettings.requireTwoFactor}
              onCheckedChange={(checked) => setSecuritySettings({
                ...securitySettings,
                requireTwoFactor: checked
              })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auditLogging">Audit Logging</Label>
              <p className="text-sm text-muted-foreground">Log all system activities</p>
            </div>
            <Switch
              id="auditLogging"
              checked={securitySettings.auditLogging}
              onCheckedChange={(checked) => setSecuritySettings({
                ...securitySettings,
                auditLogging: checked
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Database and system maintenance configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">Automatic Backup</Label>
              <p className="text-sm text-muted-foreground">Enable automatic data backups</p>
            </div>
            <Switch
              id="autoBackup"
              checked={systemSettings.autoBackup}
              onCheckedChange={(checked) => setSystemSettings({
                ...systemSettings,
                autoBackup: checked
              })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select
                value={systemSettings.backupFrequency}
                onValueChange={(value) => setSystemSettings({
                  ...systemSettings,
                  backupFrequency: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                min="30"
                max="2555"
                value={systemSettings.dataRetention}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  dataRetention: Number(e.target.value)
                })}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Enable maintenance mode</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={systemSettings.maintenanceMode}
              onCheckedChange={(checked) => setSystemSettings({
                ...systemSettings,
                maintenanceMode: checked
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
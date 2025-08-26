import React, { useState } from 'react';
import { useSupervisorSchedules } from '@/hooks/useSupervisorSchedules';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle, LogOut, Printer } from 'lucide-react';

const SupervisorDashboard = () => {
  const { schedules, loading, updateScheduleStatus } = useSupervisorSchedules();
  const { authUser, signOut } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (scheduleId: string, status: 'confirmed' | 'declined') => {
    setIsUpdating(true);
    await updateScheduleStatus(scheduleId, status, notes);
    setIsUpdating(false);
    setSelectedSchedule(null);
    setNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Assigned</Badge>;
    }
  };

  const upcomingExams = schedules.filter(s => 
    new Date(s.exam?.date || '') >= new Date() && s.status !== 'declined'
  );

  const pendingConfirmations = schedules.filter(s => s.status === 'assigned');

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {authUser?.full_name}</h1>
            <p className="text-muted-foreground">{authUser?.department} Department</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint} 
              variant="outline"
              disabled={schedules.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Schedule
            </Button>
            <Button onClick={() => {
              signOut();
              window.location.href = '/';
            }} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold">{schedules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Exams</p>
                  <p className="text-2xl font-bold">{upcomingExams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Confirmations</p>
                  <p className="text-2xl font-bold">{pendingConfirmations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Examination Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No exam schedules assigned yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{schedule.exam?.course_code}</p>
                          <p className="text-sm text-muted-foreground">{schedule.exam?.course_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{schedule.exam?.date ? new Date(schedule.exam.date).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.exam?.start_time} - {schedule.exam?.end_time}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{schedule.exam?.venue?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{schedule.exam?.venue?.building}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.is_main_supervisor ? "default" : "secondary"}>
                          {schedule.is_main_supervisor ? 'Main Supervisor' : 'Assistant'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>
                        {schedule.status === 'assigned' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedSchedule(schedule);
                                  setNotes(schedule.notes || '');
                                }}
                              >
                                Respond
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Respond to Assignment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="font-medium">{selectedSchedule?.exam?.course_code} - {selectedSchedule?.exam?.course_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedSchedule?.exam?.date} at {selectedSchedule?.exam?.start_time}
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes or comments..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleStatusUpdate(selectedSchedule?.id, 'confirmed')}
                                    disabled={isUpdating}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate(selectedSchedule?.id, 'declined')}
                                    disabled={isUpdating}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
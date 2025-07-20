import React, { useState } from 'react';
import { useESSS } from '@/context/ESSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Users, RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Schedules = () => {
  const { exams, supervisors, venues, schedules, generateSchedule } = useESSS();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      await generateSchedule();
      toast({
        title: "Success",
        description: "Schedule generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please check supervisor availability.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getExam = (examId: string) => exams.find(e => e.id === examId);
  const getSupervisor = (supervisorId: string) => supervisors.find(s => s.id === supervisorId);
  const getVenue = (venueId: string) => venues.find(v => v.id === venueId);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const filteredSchedules = selectedDate 
    ? schedules.filter(schedule => {
        const exam = getExam(schedule.examId);
        return exam?.date === selectedDate;
      })
    : schedules;

  const uniqueDates = [...new Set(exams.map(exam => exam.date))].sort();

  const upcomingExams = exams.filter(exam => new Date(exam.date) >= new Date()).length;
  const totalAssignments = schedules.length;
  const activeSupervisors = new Set(schedules.map(s => s.supervisorId)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedules</h1>
          <p className="text-muted-foreground">View and manage supervision assignments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
            className="bg-gradient-primary text-white shadow-glow"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Schedule'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Supervisors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSupervisors}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.length > 0 ? Math.round((totalAssignments / exams.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Supervision Schedule
              </CardTitle>
              <CardDescription>
                Current supervision assignments and timetable
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All dates</SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Schedule Generated</h3>
              <p className="text-muted-foreground mb-4">
                Click "Generate Schedule" to automatically assign supervisors to exams
              </p>
              <Button 
                onClick={handleGenerateSchedule}
                disabled={isGenerating}
                className="bg-gradient-primary text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate Schedule
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => {
                  const exam = getExam(schedule.examId);
                  const supervisor = getSupervisor(schedule.supervisorId);
                  const venue = getVenue(exam?.venueId || '');
                  
                  if (!exam || !supervisor) return null;
                  
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exam.courseCode}</p>
                          <p className="text-sm text-muted-foreground">{exam.courseName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {exam.startTime} - {exam.endTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{venue?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-primary text-white text-xs">
                              {getInitials(supervisor.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{supervisor.fullName}</p>
                            <p className="text-xs text-muted-foreground">{supervisor.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Assigned</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedules;
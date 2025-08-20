import React, { useState } from 'react';
import { useSchedules } from '@/hooks/useSchedules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Trash2, Printer } from 'lucide-react';

const Schedules = () => {
  const { schedules, generateSchedule, deleteSchedule, loading } = useSchedules();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleGenerateSchedule = async () => {
    try {
      setIsGenerating(true);
      await generateSchedule();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAllSchedules = async () => {
    if (!window.confirm('Are you sure you want to delete all schedules?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      // Delete all schedules one by one
      for (const schedule of schedules) {
        await deleteSchedule(schedule.id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedules</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handlePrintSchedule} 
            variant="outline"
            disabled={schedules.length === 0}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleDeleteAllSchedules} 
            variant="destructive"
            disabled={schedules.length === 0 || isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete All'}
          </Button>
          <Button onClick={handleGenerateSchedule} disabled={isGenerating}>
            <Play className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Schedule'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Schedule Assignments</CardTitle></CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No schedules generated yet</p>
              <Button onClick={handleGenerateSchedule} disabled={isGenerating}>
                Generate Schedule
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Status</TableHead>
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
                      {schedule.exam?.date ? new Date(schedule.exam.date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{schedule.venue?.name || 'N/A'}</TableCell>
                    <TableCell>{schedule.supervisor?.profile?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{schedule.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedules;
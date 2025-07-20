import React, { useState } from 'react';
import { useSchedules } from '@/hooks/useSchedules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar } from 'lucide-react';

const Schedules = () => {
  const { schedules, generateSchedule, loading } = useSchedules();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSchedule = async () => {
    try {
      setIsGenerating(true);
      await generateSchedule();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedules</h1>
        <Button onClick={handleGenerateSchedule} disabled={isGenerating}>
          <Play className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Schedule'}
        </Button>
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
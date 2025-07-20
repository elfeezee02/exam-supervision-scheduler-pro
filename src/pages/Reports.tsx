import React, { useState } from 'react';
import { useESSS } from '@/context/ESSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Download, TrendingUp, Users, Calendar, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

const Reports = () => {
  const { exams, supervisors, venues, schedules } = useESSS();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Calculate statistics
  const totalExams = exams.length;
  const totalSupervisors = supervisors.length;
  const totalVenues = venues.length;
  const totalAssignments = schedules.length;
  
  const activeSupervisors = new Set(schedules.map(s => s.supervisorId)).size;
  const utilizationRate = totalSupervisors > 0 ? (activeSupervisors / totalSupervisors) * 100 : 0;
  
  const venueUtilization = venues.map(venue => {
    const venueExams = exams.filter(exam => exam.venueId === venue.id);
    return {
      name: venue.name,
      utilization: venueExams.length,
      capacity: venue.capacity
    };
  });

  // Supervisor workload analysis
  const supervisorWorkload = supervisors.map(supervisor => {
    const assignments = schedules.filter(s => s.supervisorId === supervisor.id);
    return {
      name: supervisor.fullName,
      department: supervisor.department,
      assignments: assignments.length,
      maxAssignments: supervisor.maxAssignments || 5,
      utilization: ((assignments.length / (supervisor.maxAssignments || 5)) * 100).toFixed(1)
    };
  }).sort((a, b) => b.assignments - a.assignments);

  // Department distribution
  const departmentStats = supervisors.reduce((acc, supervisor) => {
    acc[supervisor.department] = (acc[supervisor.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentData = Object.entries(departmentStats).map(([dept, count]) => ({
    name: dept,
    value: count
  }));

  // Monthly exam distribution
  const monthlyData = exams.reduce((acc, exam) => {
    const month = new Date(exam.date).toLocaleDateString('en-US', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    exams: count
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for examination supervision</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Supervisors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSupervisors}/{totalSupervisors}</div>
            <p className="text-xs text-muted-foreground">
              {utilizationRate.toFixed(1)}% utilization rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venue Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((exams.length / totalVenues) * 10) / 10}</div>
            <p className="text-xs text-muted-foreground">
              Average exams per venue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExams > 0 ? Math.round((totalAssignments / totalExams) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Supervision coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Exam Distribution</CardTitle>
            <CardDescription>Number of exams scheduled per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="exams" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Supervisor distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart 
                  data={departmentData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPieChart>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supervisor Workload Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supervisor Workload Analysis
          </CardTitle>
          <CardDescription>
            Current supervision assignments and workload distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supervisor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisorWorkload.map((supervisor) => (
                <TableRow key={supervisor.name}>
                  <TableCell className="font-medium">{supervisor.name}</TableCell>
                  <TableCell>{supervisor.department}</TableCell>
                  <TableCell>{supervisor.assignments}</TableCell>
                  <TableCell>{supervisor.maxAssignments}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={Number(supervisor.utilization)} className="w-16" />
                      <span className="text-sm">{supervisor.utilization}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        Number(supervisor.utilization) > 80 ? "destructive" : 
                        Number(supervisor.utilization) > 60 ? "default" : 
                        "secondary"
                      }
                    >
                      {Number(supervisor.utilization) > 80 ? "Overloaded" : 
                       Number(supervisor.utilization) > 60 ? "Optimal" : 
                       "Underutilized"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Venue Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Venue Utilization Report
          </CardTitle>
          <CardDescription>
            Venue usage and capacity analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venue</TableHead>
                <TableHead>Exams Scheduled</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venueUtilization.map((venue) => (
                <TableRow key={venue.name}>
                  <TableCell className="font-medium">{venue.name}</TableCell>
                  <TableCell>{venue.utilization}</TableCell>
                  <TableCell>{venue.capacity} seats</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(venue.utilization / 10) * 100} className="w-16" />
                      <span className="text-sm">{((venue.utilization / 10) * 100).toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={venue.utilization > 5 ? "default" : "secondary"}>
                      {venue.utilization > 5 ? "High Usage" : "Low Usage"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
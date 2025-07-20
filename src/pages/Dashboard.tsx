import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useESSS } from '@/context/ESSContext';

const Dashboard = () => {
  const { dashboardStats, exams, schedules, currentUser } = useESSS();

  const statsCards = [
    {
      title: 'Total Exams',
      value: dashboardStats.totalExams,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Supervisors',
      value: dashboardStats.totalSupervisors,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Venues',
      value: dashboardStats.totalVenues,
      icon: MapPin,
      color: 'text-academic-orange',
      bgColor: 'bg-academic-orange/10'
    },
    {
      title: 'Scheduled Exams',
      value: dashboardStats.scheduledExams,
      icon: Clock,
      color: 'text-academic-purple',
      bgColor: 'bg-academic-purple/10'
    }
  ];

  const recentExams = exams.slice(0, 5);
  const recentSchedules = schedules.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === 'admin' 
              ? 'Monitor and manage examination supervision system' 
              : 'View your assignments and availability'
            }
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="card-academic">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Exams
            </CardTitle>
            <CardDescription>Latest scheduled examinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExams.length > 0 ? (
                recentExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{exam.courseCode}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exam.date).toLocaleDateString()} at {exam.startTime}
                      </p>
                    </div>
                    <span className={`badge-${exam.status === 'scheduled' ? 'available' : 'assigned'}`}>
                      {exam.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No exams scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Recent Assignments
            </CardTitle>
            <CardDescription>Latest supervisor assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchedules.length > 0 ? (
                recentSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{schedule.supervisor?.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {schedule.exam?.courseCode} • {schedule.isMainSupervisor ? 'Main' : 'Assistant'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.notificationSent ? (
                        <CheckCircle className="h-4 w-4 text-accent" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-academic-orange" />
                      )}
                      <span className={`badge-${schedule.status === 'assigned' ? 'assigned' : 'available'}`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent assignments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
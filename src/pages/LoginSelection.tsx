import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-8 fade-in">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="bg-gradient-primary p-3 rounded-xl shadow-glow">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ESSS
              </h1>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Examination Supervision
              <span className="block text-primary">Scheduling System</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Streamline your academic exam supervision with intelligent scheduling, 
              automated assignments, and real-time conflict resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-academic p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Assignment</h3>
              <p className="text-sm text-muted-foreground">Automated supervisor allocation based on availability and fairness</p>
            </div>
            <div className="card-academic p-6 text-center">
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Conflict Resolution</h3>
              <p className="text-sm text-muted-foreground">Real-time detection and resolution of scheduling conflicts</p>
            </div>
            <div className="card-academic p-6 text-center">
              <BookOpen className="h-8 w-8 text-academic-orange mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Comprehensive Management</h3>
              <p className="text-sm text-muted-foreground">Complete exam, venue, and supervisor management</p>
            </div>
          </div>
        </div>

        {/* Login Selection */}
        <div className="slide-up space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Choose Your Portal</h3>
            <p className="text-muted-foreground">Select your role to access the appropriate login</p>
          </div>

          <div className="grid gap-4">
            <Card 
              className="card-academic cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => navigate('/admin-login')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Administrator</CardTitle>
                <CardDescription>
                  Full system access and management capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="btn-academic w-full" variant="outline">
                  Admin Login
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="card-academic cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => navigate('/supervisor-login')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-accent/10 p-3 rounded-full w-fit mb-2">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Supervisor</CardTitle>
                <CardDescription>
                  View assignments, set availability, and manage schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="btn-academic w-full" variant="outline">
                  Supervisor Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
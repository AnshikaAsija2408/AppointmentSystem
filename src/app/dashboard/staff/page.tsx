'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectAuth, logoutUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/index';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Settings, BarChart3, UserPlus, LogOut, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  clientCount: number;
}

interface Question {
  id: string;
  title: string;
  category: string;
  status: string;
  messages: any[];
  createdAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export default function TBBStaffDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(selectAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");

  console.log("🎯 Staff Page - Component rendering");
  console.log("🎯 Staff Page - isAuthenticated:", isAuthenticated);
  console.log("🎯 Staff Page - user:", user);
  console.log("🎯 Staff Page - Current URL:", typeof window !== 'undefined' ? window.location.href : 'SSR');

  useEffect(() => {
    console.log("🎯 Staff Page - useEffect running");
    if (!isAuthenticated) {
      console.log("❌ Staff Page - Not authenticated, redirecting to login");
      router.push('/login');
      return;
    }
    
    if (user && user.role !== 'TBB_STAFF') {
      console.log("❌ Staff Page - User is not staff, role:", user?.role);
      // Redirect non-staff users
      if (user.role === 'ADMIN') {
        console.log("🚀 Staff Page - Redirecting to admin");
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard/client');
      }
    }
    
    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (user && user.role === 'TBB_STAFF') {
      fetchStaffData();
    }
  }, [user]);

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/staff/questions');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Filtered questions by selected project
  const filteredQuestions = selectedProject === "all"
    ? questions
    : questions.filter(q => q.project?.id === selectedProject);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🎯 STAFF DASHBOARD - Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground mt-2">
              TBB Staff Dashboard - Manage clients, meetings, and portal administration
            </p>
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
              ✅ Successfully logged in as: {user.role} | URL: /dashboard/staff
            </Badge>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Project Filter Dropdown */}
        <div className="flex items-center gap-4 mb-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Projects</p>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedProject === "all" ? projects.length : 1}
                  </p>
                  <p className="text-xs text-muted-foreground">Active assignments</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Questions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredQuestions.filter(q => q.status === 'OPEN').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Need responses</p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedProject === "all"
                      ? projects.reduce((sum, project) => sum + project.clientCount, 0)
                      : (projects.find(p => p.id === selectedProject)?.clientCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Across all projects</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Meetings scheduled</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              My Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading projects...
              </div>
            ) : (selectedProject === "all" ? projects : projects.filter(p => p.id === selectedProject)).length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No projects assigned</p>
                <p className="text-sm text-muted-foreground">Contact your administrator to be assigned to projects</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedProject === "all" ? projects : projects.filter(p => p.id === selectedProject)).map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-foreground">{project.name}</h3>
                        <Badge variant={project.isActive ? "default" : "secondary"}>
                          {project.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {project.clientCount} client{project.clientCount !== 1 ? 's' : ''}
                        </div>
                        <Link href={`/dashboard/staff/projects/${project.id}`}>
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Questions Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Questions
            </CardTitle>
            <Link href="/dashboard/staff/questions">
              <Button variant="outline" size="sm">
                View All Questions
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading questions...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No questions found</p>
                <p className="text-sm text-muted-foreground">Questions from your project clients will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.slice(0, 5).map((question) => (
                  <div key={question.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{question.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span>From: {question.client?.name || 'Unknown Client'}</span>
                          <span>•</span>
                          <span>{question.project?.name || 'No Project'}</span>
                          <span>•</span>
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(question.status)}>
                            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">
                            {question.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {question.messages.length} message{question.messages.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <Link href={`/dashboard/staff/questions/${question.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ExternalLink className="h-3 w-3" />
                          Respond
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {filteredQuestions.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/dashboard/staff/questions">
                      <Button variant="ghost">View All Questions ({filteredQuestions.length})</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

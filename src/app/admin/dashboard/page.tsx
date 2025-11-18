"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Briefcase, UserPlus, Settings, MessageSquare, Calendar, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
  totalProjects: number;
  totalStaff: number;
  totalClients: number;
  totalMeetingsThisMonth: number;
  totalQuestions: number;
}

interface RecentProject {
  id: string;
  name: string;
  description: string;
  staffCount: number;
  clientCount: number;
  createdAt: string;
}

interface RecentMeeting {
  id: string;
  title: string;
  startTime: string;
  status: string;
  createdAt: string;
}

interface RecentQuestion {
  id: string;
  title: string;
  status: string;
  clientName: string;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentProjects: RecentProject[];
  recentMeetings: RecentMeeting[];
  recentQuestions: RecentQuestion[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
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
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage projects, staff, and client access across the TBB Portal
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage projects, staff, and client access across the TBB Portal
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/projects/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData?.stats.totalProjects || 0}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">TBB Staff</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData?.stats.totalStaff || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData?.stats.totalClients || 0}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData?.stats.totalMeetingsThisMonth || 0}
                </p>
                <p className="text-xs text-muted-foreground">meetings</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/projects">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Manage Projects</h3>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage all projects in the system
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/questions">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Answer Questions</h3>
              <p className="text-sm text-muted-foreground">
                Respond to client questions and support queries
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/meetings">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Manage Meetings</h3>
              <p className="text-sm text-muted-foreground">
                View and manage all scheduled meetings
              </p>
            </CardContent>
          </Card>
        </Link>


      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects found</p>
              </div>
            ) : (
              <>
                {dashboardData?.recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-foreground">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.staffCount} staff • {project.clientCount} clients
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <Link href={`/admin/projects/${project.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
                <div className="text-center py-4">
                  <Link href="/admin/projects">
                    <Button variant="outline">View All Projects</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.recentQuestions.length === 0 && dashboardData?.recentMeetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <>
                {dashboardData?.recentQuestions.slice(0, 3).map((question) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">New question</h4>
                        <p className="text-sm text-muted-foreground">{question.title}</p>
                        <p className="text-sm text-muted-foreground">by {question.clientName}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(question.createdAt)}</p>
                      </div>
                      <Badge className={getStatusColor(question.status)}>
                        {question.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {dashboardData?.recentMeetings.slice(0, 2).map((meeting) => (
                  <div key={meeting.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Meeting scheduled</h4>
                        <p className="text-sm text-muted-foreground">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(meeting.createdAt)}</p>
                      </div>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

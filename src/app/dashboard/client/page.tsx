"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MessageSquare, Plus, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Meeting {
  id: string;
  title: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  meetingUrl?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  googleMeetLink?: string;
  startTime?: string;
  meetingType?: string;
}

interface Question {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  messages: any[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  project: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    userRole: 'client' | 'staff';
  } | null;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // First check authentication
      try {
        const authResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!authResponse.ok) {
          console.log('❌ Client Dashboard - Auth failed, redirecting to login');
          router.push('/login');
          return;
        }

        const { user: authUser } = await authResponse.json();
        console.log('✅ Client Dashboard - Auth verified, user role:', authUser.role);
        
        if (authUser.role !== 'CLIENT') {
          console.log('❌ Client Dashboard - User is not client, redirecting');
          if (authUser.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else if (authUser.role === 'TBB_STAFF' || authUser.role === 'STAFF') {
            router.push('/dashboard/staff');
          } else {
            router.push('/login');
          }
          return;
        }

        setAuthChecked(true);
      } catch (error) {
        console.error('❌ Client Dashboard - Auth check failed:', error);
        router.push('/login');
        return;
      }

      // Then fetch dashboard data
      setIsLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setError('Request timeout. Please try again.');
      }, 10000); // 10 second timeout
      
      try {
        console.log('🔄 Starting to fetch dashboard data...');
        
        // Fetch all data in parallel
        const [profileResponse, questionsResponse, meetingsResponse] = await Promise.allSettled([
          fetch('/api/user/profile'),
          fetch('/api/questions'),
          fetch('/api/meetings')
        ]);
        
        console.log('📊 API responses received:', {
          profile: profileResponse.status,
          questions: questionsResponse.status,
          meetings: meetingsResponse.status
        });

        // Handle profile data
        if (profileResponse.status === 'fulfilled' && profileResponse.value.ok) {
          const profileData = await profileResponse.value.json();
          console.log('✅ Profile data loaded:', profileData);
          setUser(profileData);
        } else {
          console.error('❌ Error fetching user profile:', profileResponse);
          if (profileResponse.status === 'rejected') {
            setError('Failed to load user profile');
          } else if (profileResponse.status === 'fulfilled' && !profileResponse.value.ok) {
            console.error('❌ Profile response not ok:', profileResponse.value.status);
            if (profileResponse.value.status === 401) {
              setError('Authentication failed. Please log in again.');
            } else {
              setError('Failed to load user profile');
            }
          }
        }

        // Handle questions data
        if (questionsResponse.status === 'fulfilled' && questionsResponse.value.ok) {
          const questionsData = await questionsResponse.value.json();
          console.log('✅ Questions data loaded:', questionsData.length, 'questions');
          setQuestions(questionsData);
        } else {
          console.error('❌ Error fetching questions:', questionsResponse);
          if (questionsResponse.status === 'rejected') {
            setError('Failed to load questions');
          } else if (questionsResponse.status === 'fulfilled' && !questionsResponse.value.ok) {
            console.error('❌ Questions response not ok:', questionsResponse.value.status);
            if (questionsResponse.value.status === 401) {
              setError('Authentication failed. Please log in again.');
            } else {
              setError('Failed to load questions');
            }
          }
        }

        // Handle meetings data
        if (meetingsResponse.status === 'fulfilled' && meetingsResponse.value.ok) {
          const meetingsData = await meetingsResponse.value.json();
          console.log('✅ Meetings data loaded:', meetingsData.length, 'meetings');
          setMeetings(meetingsData);
        } else {
          console.error('❌ Error fetching meetings:', meetingsResponse);
          if (meetingsResponse.status === 'rejected') {
            setError('Failed to load meetings');
          } else if (meetingsResponse.status === 'fulfilled' && !meetingsResponse.value.ok) {
            console.error('❌ Meetings response not ok:', meetingsResponse.value.status);
            if (meetingsResponse.value.status === 401) {
              setError('Authentication failed. Please log in again.');
            } else {
              setError('Failed to load meetings');
            }
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data');
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-800 font-medium">Error: {error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
          <p className="text-red-600 text-sm mt-1">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-foreground">
          🔴 CLIENT DASHBOARD - Welcome to TBB Portal
          {user?.name && (
            <span className="text-2xl text-muted-foreground font-normal ml-2">
              {user.name}
            </span>
          )}
        </h1>
        <div className="mt-2 space-y-1">
          <p className="text-muted-foreground">
            Manage your meetings and get support from the TBB team
          </p>
          {user?.project ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {user.project.userRole === 'client' ? 'Client' : 'Staff Member'}
              </Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-medium text-foreground">
                Project: {user.project.name}
              </span>
              {user.project.description && (
                <>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {user.project.description}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                No Project Assigned
              </Badge>
              <span className="text-sm text-muted-foreground">
                Contact your administrator to be assigned to a project
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/client/schedule-meeting">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Schedule Meeting</h3>
              <p className="text-sm text-muted-foreground">Book time with TBB team</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/client/ask-question">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Ask Question</h3>
              <p className="text-sm text-muted-foreground">Get instant support</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">Meeting History</h3>
            <p className="text-sm text-muted-foreground">Past meetings & recordings</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Meetings</CardTitle>
            <Link href="/dashboard/client/schedule-meeting">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Loading meetings...</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No meetings scheduled</p>
                <Link href="/dashboard/client/schedule-meeting">
                  <Button variant="outline" className="mt-2">
                    Schedule Your First Meeting
                  </Button>
                </Link>
              </div>
            ) : (
              meetings.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {meeting.scheduledDate 
                          ? `${formatDate(meeting.scheduledDate)} at ${formatTime(meeting.scheduledTime!)}`
                          : `Requested: ${formatDate(meeting.preferredDate)} at ${formatTime(meeting.preferredTime)}`
                        }
                      </p>
                      <Badge className={`mt-2 ${getStatusColor(meeting.status)}`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {meeting.meetingUrl && meeting.status === 'confirmed' && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {meetings.length > 3 && (
              <div className="text-center">
               <Link href="/dashboard/client/meetings">
                 <Button variant="ghost">View All Meetings</Button>
               </Link>  
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Questions</CardTitle>
            <Link href="/dashboard/client/ask-question">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No questions asked yet</p>
                <Link href="/dashboard/client/ask-question">
                  <Button variant="outline" className="mt-2">
                    Ask Your First Question
                  </Button>
                </Link>
              </div>
            ) : (
              questions.slice(0, 3).map((question) => (
                <Link key={question.id} href={`/dashboard/client/questions/${question.id}`}>
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{question.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(question.createdAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(question.status)}>
                            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                          </Badge>
                          {question.messages.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {question.messages.length} message{question.messages.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
            {questions.length > 3 && (
              <div className="text-center">
                <Link href="/dashboard/client/questions">
                  <Button variant="ghost">View All Questions</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming meetings</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/dashboard/client/schedule-meeting')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{meeting.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(meeting.startTime!).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(meeting.startTime!).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {meeting.meetingType}
                        </Badge>
                      </div>
                      {meeting.googleMeetLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(meeting.googleMeetLink, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {meetings.length > 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/client/schedule-meeting')}
                  >
                    View All Meetings
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

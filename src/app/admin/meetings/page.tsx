 "use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingType: string;
  googleMeetLink?: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  tbbStaff: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function AdminMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const data = await response.json();
        // Validate that data is an array and has the expected structure
        if (Array.isArray(data)) {
          setMeetings(data);
        } else {
          console.error('Invalid data format received:', data);
          toast.error('Invalid data format received');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to fetch meetings');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meetings Management</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all scheduled meetings
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meetings Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all scheduled meetings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No meetings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{meeting.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(meeting.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {meeting.client?.name || 'Unknown Client'} & {meeting.tbbStaff?.name || 'Unknown Staff'}
                        </div>
                        <span>•</span>
                        <span>{meeting.project?.name || 'Unknown Project'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {meeting.meetingType}
                        </Badge>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
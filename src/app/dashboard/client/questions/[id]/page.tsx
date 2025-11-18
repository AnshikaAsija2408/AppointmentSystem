"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, ArrowLeft, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";

interface Message {
  content: string;
  sender: string;
  senderRole: string;
  senderName?: string;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  category: string;
  status: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function ClientQuestionDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionId, setQuestionId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuestionId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (!questionId) return;
      
      try {
        const response = await fetch(`/api/questions/${questionId}/messages`);
        if (response.ok) {
          const question = await response.json();
          console.log("Fetched question details:", question);
          setQuestion(question);
        }
      } catch (error) {
        console.error('Error fetching question details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (questionId) {
      fetchQuestionDetails();
    }
  }, [questionId]);

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/questions/${questionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new message to the local state
        console.log("Follow-up message submitted:", data);
        setQuestion(prevQuestion => {
          if (!prevQuestion) return null;
          return {
            ...prevQuestion,
            messages: [...prevQuestion.messages, data.newMessage]
          };
        });
        setNewMessage('');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to submit follow-up message'}`);
      }
    } catch (error) {
      console.error('Error submitting follow-up:', error);
      alert('Error submitting follow-up message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return '🔔';
      case 'in_progress':
        return '⚡';
      case 'resolved':
        return '✅';
      case 'closed':
        return '🔒';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading question details...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Question Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The question you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/dashboard/client/questions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Button>
        </Link>
      </div>
    );
  }

  const responseCount = question.messages.filter(msg => msg.senderRole.toUpperCase() !== 'CLIENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/client/questions">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon(question.status)}</span>
          <h1 className="text-2xl font-bold text-foreground">{question.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(question.status)}>
                      {question.status.charAt(0).toUpperCase() + question.status.slice(1).replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {question.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Asked {formatDate(question.createdAt)}</span>
                    </div>
                    {question.updatedAt !== question.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated {formatDate(question.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation ({question.messages.length} messages)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {question.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.senderRole.toUpperCase() === 'CLIENT'
                        ? 'bg-blue-50 border-l-4 border-blue-400 ml-0 mr-8'
                        : 'bg-green-50 border-l-4 border-green-400 ml-8 mr-0'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {message.senderRole.toUpperCase() === 'CLIENT' ? 'You' : (message.senderName || 'TBB Team')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.senderRole.toUpperCase() === 'CLIENT' ? 'Client' : 'Support'}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Follow-up Message Form */}
              {question.status !== 'CLOSED' && (
                <form onSubmit={handleFollowUpSubmit} className="border-t pt-4 space-y-4">
                  <h4 className="font-medium text-foreground">Add a follow-up message</h4>
                  <Textarea
                    placeholder="Add additional details or ask a follow-up question..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-24"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}

              {question.status === 'CLOSED' && (
                <div className="border-t pt-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      This question has been closed. If you need further assistance, please create a new question.
                    </p>
                    <Link href="/dashboard/client/ask-question">
                      <Button variant="outline" className="mt-3">
                        Ask New Question
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status:</span>
                <Badge className={getStatusColor(question.status)}>
                  {question.status.charAt(0).toUpperCase() + question.status.slice(1).replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge variant="outline">{question.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Messages:</span>
                <span className="text-sm font-medium">{question.messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Responses:</span>
                <span className="text-sm font-medium text-green-600">{responseCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What This Status Means</CardTitle>
            </CardHeader>
            <CardContent>
              {question.status === 'OPEN' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your question has been received and is waiting for a response from our team.
                  </p>
                  <p className="text-xs text-yellow-600 font-medium">
                    Expected response time: Within 24 hours
                  </p>
                </div>
              )}
              {question.status === 'IN_PROGRESS' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Our team is actively working on your question and will provide an update soon.
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    You may receive follow-up questions
                  </p>
                </div>
              )}
              {question.status === 'RESOLVED' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your question has been answered. Please review the response and let us know if you need further assistance.
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    You can still add follow-up messages
                  </p>
                </div>
              )}
              {question.status === 'CLOSED' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This question has been closed. If you need further assistance, please create a new question.
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    No further messages can be added
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/client/questions">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View All Questions
                </Button>
              </Link>
              <Link href="/dashboard/client/ask-question">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Ask New Question
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

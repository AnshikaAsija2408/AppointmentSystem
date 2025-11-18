"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface Message {
  content: string;
  sender: string;
  senderRole: string;
  senderName?: string;
  senderEmail?: string;
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

export default function AdminQuestionDetails({ params }: { params: Promise<{ id: string }> }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
      setIsLoading(true);
      try {
        const response = await fetch(`/api/questions/${questionId}`);
        if (response.ok) {
          const data = await response.json();
          setQuestion(data);
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

  const submitResponse = async () => {
    if (!question || !responseMessage.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: responseMessage }),
      });
      if (response.ok) {
        setResponseMessage("");
        // Refetch question details
        const detailsResponse = await fetch(`/api/questions/${question.id}`);
        if (detailsResponse.ok) {
          const data = await detailsResponse.json();
          setQuestion(data);
        }
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsResolved = async () => {
    if (!question) return;
    setIsResolving(true);
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      if (response.ok) {
        const detailsResponse = await fetch(`/api/questions/${question.id}`);
        if (detailsResponse.ok) {
          const data = await detailsResponse.json();
          setQuestion(data);
        }
      }
    } catch (error) {
      console.error('Error resolving question:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const closeQuestion = async () => {
    if (!question) return;
    setIsClosing(true);
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      if (response.ok) {
        const detailsResponse = await fetch(`/api/questions/${question.id}`);
        if (detailsResponse.ok) {
          const data = await detailsResponse.json();
          setQuestion(data);
        }
      }
    } catch (error) {
      console.error('Error closing question:', error);
    } finally {
      setIsClosing(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading question details...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Question not found</p>
        <Link href="/admin/questions">
          <Button variant="outline" className="mt-4">
            Back to Questions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/questions">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Question Details</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{question.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(question.status)}>
                      {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{question.category}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Q&A chat style */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {question.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg flex flex-col ${
                      message.senderRole === 'CLIENT'
                        ? 'bg-blue-50 border-l-4 border-blue-400 items-start'
                        : 'bg-green-50 border-r-4 border-green-400 items-end'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{message.senderName || 'Unknown User'}</span>
                      <Badge variant="outline" className="text-xs">{message.senderRole}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
              </div>
              {/* Only show typing/status controls if not closed */}
              {question.status !== 'CLOSED' && (
                <div className="border-t pt-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <Textarea
                      placeholder="Type your response here..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="min-h-32 flex-1"
                    />
                    <Button
                      onClick={submitResponse}
                      disabled={!responseMessage.trim() || isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Send'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={markAsResolved}
                      disabled={isResolving}
                    >
                      {isResolving ? 'Marking...' : 'Mark as Resolved'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={closeQuestion}
                      disabled={isClosing}
                    >
                      {isClosing ? 'Closing...' : 'Close Question'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              {question.client ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Name:</span>
                    <p className="text-sm text-foreground">{question.client.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <p className="text-sm text-foreground">{question.client.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No client information available</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              {question.project ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Project:</span>
                    <p className="text-sm text-foreground">{question.project.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Description:</span>
                    <p className="text-sm text-foreground">{question.project.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No project information available</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Created:</span>
                  <p className="text-sm text-foreground">{formatDate(question.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                  <p className="text-sm text-foreground">{formatDate(question.updatedAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Messages:</span>
                  <p className="text-sm text-foreground">{question.messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

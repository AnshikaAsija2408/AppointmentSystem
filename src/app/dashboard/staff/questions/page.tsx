"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, User, Calendar, Send, ChevronLeft, RefreshCw, Briefcase } from "lucide-react";
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

interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  clientCount: number;
}

export default function StaffQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseStatus, setResponseStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/staff/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionDetails = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedQuestion(data);
        setResponseStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
    }
  };

  const submitResponse = async () => {
    if (!selectedQuestion || !responseMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/questions/${selectedQuestion.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: responseMessage,
          status: responseStatus
        }),
      });

      if (response.ok) {
        setResponseMessage("");
        await fetchQuestionDetails(selectedQuestion.id);
        await fetchData();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
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

  const filteredQuestions = selectedProject === "all" 
    ? questions 
    : questions.filter(q => q.project?.id === selectedProject);

  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedQuestion(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Questions
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Question Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedQuestion.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedQuestion.status)}>
                        {selectedQuestion.status.charAt(0).toUpperCase() + selectedQuestion.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedQuestion.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedQuestion.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        message.senderRole === 'CLIENT'
                          ? 'bg-blue-50 border-l-4 border-blue-400'
                          : 'bg-green-50 border-l-4 border-green-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {message.senderName || 'Unknown User'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.senderRole}
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

                <div className="border-t pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Select value={responseStatus} onValueChange={setResponseStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Type your response here..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="min-h-32"
                    />
                    <Button
                      onClick={submitResponse}
                      disabled={!responseMessage.trim() || isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Send Response'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedQuestion.client ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Name:</span>
                      <p className="text-sm text-foreground">{selectedQuestion.client.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <p className="text-sm text-foreground">{selectedQuestion.client.email}</p>
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
                {selectedQuestion.project ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Project:</span>
                      <p className="text-sm text-foreground">{selectedQuestion.project.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <p className="text-sm text-foreground">{selectedQuestion.project.description}</p>
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
                    <p className="text-sm text-foreground">{formatDate(selectedQuestion.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                    <p className="text-sm text-foreground">{formatDate(selectedQuestion.updatedAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Messages:</span>
                    <p className="text-sm text-foreground">{selectedQuestion.messages.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Question Management</h1>
          <p className="text-muted-foreground mt-2">
            Review and respond to questions from your project clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
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
          <Button
            onClick={fetchData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Project Filter Stats */}
      {selectedProject !== "all" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {projects.find(p => p.id === selectedProject)?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} • {' '}
                  {filteredQuestions.filter(q => q.status === 'OPEN').length} open
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedProject === "all" ? "All Questions" : "Project Questions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedProject === "all" ? "No questions found" : "No questions found for this project"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => fetchQuestionDetails(question.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{question.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {question.client?.name || 'Unknown Client'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(question.createdAt)}
                        </div>
                        <span>•</span>
                        <span>{question.project?.name || 'No Project'}</span>
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
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
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

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

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");

  useEffect(() => {
    fetchQuestions();
    fetchProjects();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      if (response.ok) {
        const data = await response.json();
        // The API returns an array of projects, not { projects: [...] }
        setProjects(Array.isArray(data) ? data.map((p: any) => ({ id: p.id || p._id, name: p.name })) : []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Question Management</h1>
          <p className="text-muted-foreground mt-2">
            Review and respond to client questions and support requests
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
            onClick={fetchQuestions}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No questions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/admin/questions/${question.id}`}
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
                    <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); window.location.href = `/admin/questions/${question.id}`; }}>
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

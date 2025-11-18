"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Calendar, User, ArrowRight, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

interface Question {
  id: string;
  title: string;
  category: string;
  status: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

export default function ClientQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const data = await response.json();
        toast.success("Questions loaded successfully");
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || question.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getResponseCount = (messages: any[]) => {
    return messages.filter(msg => msg.senderRole !== 'CLIENT').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Questions</h1>
          <p className="text-muted-foreground mt-2">
            View all your questions and track their progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchQuestions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/client/ask-question">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ask New Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "open" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("open")}
              >
                Open
              </Button>
              <Button
                variant={statusFilter === "in_progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("in_progress")}
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === "resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("resolved")}
              >
                Resolved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Questions ({filteredQuestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your questions...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              {searchTerm || statusFilter !== "all" ? (
                <div>
                  <p className="text-muted-foreground mb-2">No questions match your filters</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">You haven't asked any questions yet</p>
                  <Link href="/dashboard/client/ask-question">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ask Your First Question
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-6 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{getStatusIcon(question.status)}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-green-600 transition-colors">
                            {question.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Asked {formatDate(question.createdAt)}</span>
                            </div>
                            {question.updatedAt !== question.createdAt && (
                              <div className="flex items-center gap-1">
                                <span>•</span>
                                <span>Updated {formatDate(question.updatedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(question.status)}>
                          {question.status.charAt(0).toUpperCase() + question.status.slice(1).replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {question.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span>
                            {question.messages.length} message{question.messages.length !== 1 ? 's' : ''}
                          </span>
                          {getResponseCount(question.messages) > 0 && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {getResponseCount(question.messages)} response{getResponseCount(question.messages) !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {question.messages.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            <strong>Latest:</strong> {question.messages[question.messages.length - 1]?.content}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Link href={`/dashboard/client/questions/${question.id}`}>
                        <Button variant="outline" size="sm" className="group-hover:bg-green-50 group-hover:border-green-300">
                          <span className="mr-2">View Details</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      
                      {question.status === 'OPEN' && getResponseCount(question.messages) === 0 && (
                        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                          Awaiting response
                        </div>
                      )}
                      
                      {question.status === 'IN_PROGRESS' && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Being worked on
                        </div>
                      )}
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
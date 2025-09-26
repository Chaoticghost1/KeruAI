import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  FileText, 
  Upload, 
  Settings, 
  BarChart3, 
  BookOpen,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  CheckCircle,
  Bot,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Globe,
  Gamepad2,
  Shield,
  Code,
  Database,
  Save,
  RefreshCw,
  Activity,
  Home,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Telegram Bot Management State
  const [botPersonas, setBotPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [personaForm, setPersonaForm] = useState({
    name: "",
    key: "",
    description: "",
    systemPrompt: "",
    subjects: "",
    isActive: true
  });

  // Blog Management State
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    isPublished: false
  });

  // Analytics Data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  // Budget Analytics
  const { data: budgetAnalytics, isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/admin/budget-analytics'],
    enabled: !!user?.role && user.role === 'superuser'
  });

  // Chat Analytics
  const { data: chatAnalytics, isLoading: chatLoading } = useQuery({
    queryKey: ['/api/admin/chat-analytics'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  // Bot Personas Query
  const { data: personas, isLoading: personasLoading } = useQuery({
    queryKey: ['/api/admin/bot-personas'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  // Blog Posts Query
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/admin/blog-posts'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  // Bot Persona Mutations
  const createPersonaMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/bot-personas", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bot-personas'] });
      toast({ title: "Bot persona created successfully" });
      resetPersonaForm();
    },
    onError: (error) => {
      toast({ title: "Failed to create persona", description: error.message, variant: "destructive" });
    }
  });

  const updatePersonaMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PUT", `/api/admin/bot-personas/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/admin/bot-personas']);
      toast({ title: "Bot persona updated successfully" });
      resetPersonaForm();
    },
    onError: (error) => {
      toast({ title: "Failed to update persona", description: error.message, variant: "destructive" });
    }
  });

  const deletePersonaMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest("DELETE", `/api/admin/bot-personas/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/admin/bot-personas']);
      toast({ title: "Bot persona deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete persona", description: error.message, variant: "destructive" });
    }
  });

  // Blog Post Mutations
  const createBlogMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/admin/blog-posts", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/admin/blog-posts']);
      toast({ title: "Blog post created successfully" });
      resetBlogForm();
    },
    onError: (error) => {
      toast({ title: "Failed to create blog post", description: error.message, variant: "destructive" });
    }
  });

  const updateBlogMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PUT", `/api/admin/blog-posts/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/admin/blog-posts']);
      toast({ title: "Blog post updated successfully" });
      resetBlogForm();
    },
    onError: (error) => {
      toast({ title: "Failed to update blog post", description: error.message, variant: "destructive" });
    }
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest("DELETE", `/api/admin/blog-posts/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/admin/blog-posts']);
      toast({ title: "Blog post deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete blog post", description: error.message, variant: "destructive" });
    }
  });

  const resetPersonaForm = () => {
    setPersonaForm({
      name: "",
      key: "",
      description: "",
      systemPrompt: "",
      subjects: "",
      isActive: true
    });
    setSelectedPersona(null);
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      tags: "",
      isPublished: false
    });
    setSelectedPost(null);
  };

  const handlePersonaSubmit = (e) => {
    e.preventDefault();
    if (selectedPersona) {
      updatePersonaMutation.mutate({ id: selectedPersona.id, data: personaForm });
    } else {
      createPersonaMutation.mutate(personaForm);
    }
  };

  const handleBlogSubmit = (e) => {
    e.preventDefault();
    if (selectedPost) {
      updateBlogMutation.mutate({ id: selectedPost.id, data: blogForm });
    } else {
      createBlogMutation.mutate(blogForm);
    }
  };

  const editPersona = (persona) => {
    setSelectedPersona(persona);
    setPersonaForm({
      name: persona.name,
      key: persona.key,
      description: persona.description,
      systemPrompt: persona.systemPrompt,
      subjects: persona.subjects?.join(', ') || '',
      isActive: persona.isActive
    });
  };

  const editBlogPost = (post) => {
    setSelectedPost(post);
    setBlogForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags?.join(', ') || '',
      isPublished: post.isPublished
    });
  };

  // Protect access - only superuser and teachers can access
  if (!user || !['superuser', 'teacher'].includes(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need superuser or teacher privileges to access the admin panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName} {user.lastName} ({user.role})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            {user.role === 'superuser' ? 'Super Administrator' : 'Administrator'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="study-buddy">Study Buddy</TabsTrigger>
          <TabsTrigger value="budget-analytics">Budget Analytics</TabsTrigger>
          <TabsTrigger value="chat-management">Chat Management</TabsTrigger>
          <TabsTrigger value="travel-blog">Travel Blog</TabsTrigger>
          {user.role === 'superuser' && (
            <TabsTrigger value="super-admin">Super Admin</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData?.newUsersThisMonth || 0} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.activeSessions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {budgetAnalytics?.totalTransactions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Requests</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatAnalytics?.totalRequests || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Study Buddy Management Tab */}
        <TabsContent value="study-buddy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Telegram Bot Persona Management
              </CardTitle>
              <CardDescription>
                Manage AI tutors for the Aprende Conmigo Telegram bot integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Persona List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bot Personas</h3>
                  {personasLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {personas?.map((persona) => (
                        <Card key={persona.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{persona.name}</h4>
                              <p className="text-sm text-muted-foreground">{persona.key}</p>
                              <Badge variant={persona.isActive ? "default" : "secondary"}>
                                {persona.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => editPersona(persona)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deletePersonaMutation.mutate(persona.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Persona Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {selectedPersona ? 'Edit Persona' : 'Create New Persona'}
                  </h3>
                  <form onSubmit={handlePersonaSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="persona-name">Persona Name</Label>
                      <Input
                        id="persona-name"
                        value={personaForm.name}
                        onChange={(e) => setPersonaForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Math Tutor"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona-key">Persona Key</Label>
                      <Input
                        id="persona-key"
                        value={personaForm.key}
                        onChange={(e) => setPersonaForm(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="e.g., math_tutor"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona-description">Description</Label>
                      <Input
                        id="persona-description"
                        value={personaForm.description}
                        onChange={(e) => setPersonaForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the persona"
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona-prompt">System Prompt</Label>
                      <Textarea
                        id="persona-prompt"
                        value={personaForm.systemPrompt}
                        onChange={(e) => setPersonaForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                        placeholder="Enter the system prompt for this AI persona..."
                        rows={6}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona-subjects">Subjects (comma-separated)</Label>
                      <Input
                        id="persona-subjects"
                        value={personaForm.subjects}
                        onChange={(e) => setPersonaForm(prev => ({ ...prev, subjects: e.target.value }))}
                        placeholder="e.g., mathematics, algebra, geometry"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="persona-active"
                        checked={personaForm.isActive}
                        onChange={(e) => setPersonaForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <Label htmlFor="persona-active">Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createPersonaMutation.isPending || updatePersonaMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {selectedPersona ? 'Update' : 'Create'} Persona
                      </Button>
                      {selectedPersona && (
                        <Button type="button" variant="outline" onClick={resetPersonaForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Analytics Tab */}
        <TabsContent value="budget-analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                BudgetPal Analytics (Anonymous)
              </CardTitle>
              <CardDescription>
                Privacy-compliant budget tracking analytics - all data is anonymized
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budgetLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Registered Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {budgetAnalytics?.registeredUsers || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total users using BudgetPal
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Monthly Average Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {budgetAnalytics?.monthlyAvgTransactions || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Per user average
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Average Monthly Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${budgetAnalytics?.avgMonthlyExpense || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anonymous average
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Average Monthly Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${budgetAnalytics?.avgMonthlyIncome || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anonymous average
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {budgetAnalytics?.totalTransactions || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All time
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Most Popular Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {budgetAnalytics?.popularCategory || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Most used expense category
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Management Tab */}
        <TabsContent value="chat-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Request Analytics
              </CardTitle>
              <CardDescription>
                Monitor chat patterns and frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Total Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {chatAnalytics?.totalRequests || 0}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {chatAnalytics?.thisMonth || 0}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Average per Day</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {chatAnalytics?.avgPerDay || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Most Frequent Questions</h3>
                    <div className="space-y-2">
                      {chatAnalytics?.frequentQuestions?.map((question, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{question.text}</p>
                            <Badge>{question.count} times</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Travel Blog Management Tab */}
        <TabsContent value="travel-blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Viajes y Cruceros Blog Management
              </CardTitle>
              <CardDescription>
                Create, edit, and manage travel blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Blog Posts List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Blog Posts</h3>
                    <Button onClick={resetBlogForm}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </div>
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {posts?.map((post) => (
                        <Card key={post.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{post.title}</h4>
                              <p className="text-sm text-muted-foreground">{post.category}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant={post.isPublished ? "default" : "secondary"}>
                                  {post.isPublished ? "Published" : "Draft"}
                                </Badge>
                                {post.isHidden && (
                                  <Badge variant="outline">Hidden</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => editBlogPost(post)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteBlogMutation.mutate(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Blog Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {selectedPost ? 'Edit Post' : 'Create New Post'}
                  </h3>
                  <form onSubmit={handleBlogSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="blog-title">Title</Label>
                      <Input
                        id="blog-title"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter blog post title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="blog-category">Category</Label>
                      <Select value={blogForm.category} onValueChange={(value) => setBlogForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cruises">Cruises</SelectItem>
                          <SelectItem value="destinations">Destinations</SelectItem>
                          <SelectItem value="travel-tips">Travel Tips</SelectItem>
                          <SelectItem value="reviews">Reviews</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="blog-excerpt">Excerpt</Label>
                      <Textarea
                        id="blog-excerpt"
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief description of the post"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="blog-content">Content</Label>
                      <Textarea
                        id="blog-content"
                        value={blogForm.content}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your blog post content here..."
                        rows={10}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
                      <Input
                        id="blog-tags"
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g., cruise, caribbean, vacation"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="blog-published"
                        checked={blogForm.isPublished}
                        onChange={(e) => setBlogForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                      />
                      <Label htmlFor="blog-published">Publish immediately</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createBlogMutation.isPending || updateBlogMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {selectedPost ? 'Update' : 'Create'} Post
                      </Button>
                      {selectedPost && (
                        <Button type="button" variant="outline" onClick={resetBlogForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Super Admin Only Tab */}
        {user.role === 'superuser' && (
          <TabsContent value="super-admin" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    CruiseWord Game
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage game settings, levels, and user progress
                  </p>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Game Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    DAO Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Decentralized Autonomous Organization controls
                  </p>
                  <Button className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    DAO Controls
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    AethosByte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced system configurations and security
                  </p>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    System Config
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Health & Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Database Status</h4>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">API Health</h4>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Telegram Bot</h4>
                    <Badge variant="secondary">Not Connected</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">External Services</h4>
                    <Badge variant="default">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
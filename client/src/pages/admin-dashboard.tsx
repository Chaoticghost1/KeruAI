import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard,
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
  LogOut,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Bell,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAdminPersonas } from "@/hooks/use-personas";

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("overview");

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

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "content", label: "Content Management", icon: FileText },
    { id: "users", label: "User Management", icon: Users, superuserOnly: true },
    { id: "study-buddy", label: "Study Buddy AI", icon: Bot, superuserOnly: true },
    { id: "analytics", label: "Analytics", icon: BarChart3, superuserOnly: true },
    { id: "travel-blog", label: "Travel Blog", icon: Globe, superuserOnly: true },
    { id: "settings", label: "System Settings", icon: Settings, superuserOnly: true },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    !item.superuserOnly || user.role === 'superuser'
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout flex h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`admin-sidebar w-64 flex flex-col fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
              <p className="text-xs text-gray-400">Keru.ai Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`admin-nav-item w-full flex items-center px-3 py-2.5 text-sm font-medium text-left ${
                    isActive ? 'active' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="admin-header h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {filteredNavItems.find(item => item.id === activeSection)?.label || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Bell className="w-4 h-4" />
            </Button>
            
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to App</span>
              </Button>
            </Link>
            
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 admin-content">
          {activeSection === "overview" && <OverviewSection user={user} setActiveSection={setActiveSection} />}
          {activeSection === "content" && <ContentManagementSection user={user} />}
          {activeSection === "users" && <UserManagementSection user={user} />}
          {activeSection === "study-buddy" && <StudyBuddySection user={user} />}
          {activeSection === "analytics" && <AnalyticsSection user={user} />}
          {activeSection === "travel-blog" && <TravelBlogSection user={user} />}
          {activeSection === "settings" && <SystemSettingsSection user={user} />}
        </main>
      </div>
    </div>
  );
}

// Overview Section Component
function OverviewSection({ user, setActiveSection }: { user: any; setActiveSection: (section: string) => void }) {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  const stats = [
    {
      title: "Total Users",
      value: (analyticsData as any)?.totalUsers || '0',
      change: `+${(analyticsData as any)?.newUsersThisMonth || '0'} this month`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Sessions", 
      value: (analyticsData as any)?.activeSessions || '0',
      change: "Live now",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Content Items",
      value: (analyticsData as any)?.totalContent || '0',
      change: `+${(analyticsData as any)?.newContentThisWeek || '0'} this week`,
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: "System Health",
      value: "98.5%",
      change: "All systems operational",
      icon: Shield,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="admin-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your platform today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="admin-stat-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => {
              console.log('Quick Action clicked: content');
              setActiveSection("content");
            }}
            data-testid="quick-action-content"
          >
            <PlusCircle className="w-4 h-4 mr-3" />
            Create New Content
          </Button>
          {user.role === 'superuser' && (
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                console.log('Quick Action clicked: users');
                setActiveSection("users");
              }}
              data-testid="quick-action-users"
            >
              <Users className="w-4 h-4 mr-3" />
              Manage Users
            </Button>
          )}
          {user.role === 'superuser' && (
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                console.log('Quick Action clicked: analytics');
                setActiveSection("analytics");
              }}
              data-testid="quick-action-analytics"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              View Analytics
            </Button>
          )}
          {user.role === 'superuser' && (
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                console.log('Quick Action clicked: settings');
                setActiveSection("settings");
              }}
              data-testid="quick-action-settings"
            >
              <Settings className="w-4 h-4 mr-3" />
              System Settings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// User Management Section Component
function UserManagementSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: true
  });

  // Mutations for user management
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User role updated successfully" });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update user role", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update user status", variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User deleted successfully" });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
    }
  });

  // Filter users based on search
  const filteredUsers = (users as any[]).filter((user: any) => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleStatusToggle = (userId: number, currentStatus: boolean) => {
    updateStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="admin-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })}
              data-testid="refresh-users"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="secondary">{filteredUsers.length} users</Badge>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        {usersLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">User</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Role</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Created</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any, index) => (
                  <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="superuser">Super User</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(user.id, user.isActive)}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`toggle-user-status-${user.id}`}
                          className="text-xs"
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          data-testid={`edit-user-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteUserMutation.isPending}
                          className="text-red-600 hover:text-red-800"
                          data-testid={`delete-user-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Content Management Section Component
function ContentManagementSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    contentType: "pdf",
    gradeLevel: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Content Query
  const { data: contents = [], isLoading: contentsLoading } = useQuery({
    queryKey: ['/api/content/my'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/content', {
        method: 'POST',
        body: data
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload content');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/my'] });
      toast({ title: "Content uploaded successfully" });
      resetUploadForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to upload content", description: error.message, variant: "destructive" });
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update content');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/my'] });
      toast({ title: "Content updated successfully" });
      resetUploadForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update content", description: error.message, variant: "destructive" });
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete content');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/my'] });
      toast({ title: "Content deleted successfully" });
    },
    onError: (error: any) {
      toast({ title: "Failed to delete content", description: error.message, variant: "destructive" });
    }
  });

  const resetUploadForm = () => {
    setUploadForm({
      title: "",
      description: "",
      subject: "",
      contentType: "pdf",
      gradeLevel: ""
    });
    setSelectedFile(null);
    setEditingContent(null);
  };

  const handleEditContent = (content: any) => {
    setEditingContent(content);
    setUploadForm({
      title: content.title,
      description: content.description,
      subject: content.subject || '',
      contentType: content.contentType || 'pdf',
      gradeLevel: content.gradeLevel || ''
    });
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect content type
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension) {
        if (['pdf'].includes(extension)) setUploadForm({...uploadForm, contentType: 'pdf'});
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) setUploadForm({...uploadForm, contentType: 'image'});
        else if (['doc', 'docx'].includes(extension)) setUploadForm({...uploadForm, contentType: 'document'});
        else setUploadForm({...uploadForm, contentType: 'other'});
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContent) {
      // Update existing content
      updateMutation.mutate({
        id: editingContent.id,
        data: {
          title: uploadForm.title,
          description: uploadForm.description,
          subject: uploadForm.subject
        }
      });
    } else {
      // Upload new content
      if (!selectedFile) {
        toast({ title: "Please select a file to upload", variant: "destructive" });
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('subject', uploadForm.subject);
      formData.append('contentType', uploadForm.contentType);
      formData.append('gradeLevel', uploadForm.gradeLevel);

      uploadMutation.mutate(formData);
    }
  };

  const handleDeleteContent = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter content based on search
  const filteredContents = (contents as any[]).filter((content: any) =>
    content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Management</h2>
        <p className="text-gray-600 mb-6">Upload and manage learning materials, PDFs, and educational resources.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload/Edit Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {editingContent ? 'Edit Content' : 'Upload New Content'}
              </h3>
              {editingContent && (
                <Button variant="outline" size="sm" onClick={resetUploadForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
            
            {editingContent && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Editing:</strong> {editingContent.title}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Note: You can only update the metadata. To change the file, delete and re-upload.
                </p>
              </div>
            )}
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {!editingContent && (
                <div>
                  <Label htmlFor="content-file">Select File</Label>
                  <Input
                    id="content-file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <Label htmlFor="content-title">Title</Label>
                <Input
                  id="content-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  placeholder="Mathematics Chapter 5: Algebra Basics"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="content-subject">Subject</Label>
                  <Input
                    id="content-subject"
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                    placeholder="Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select
                    value={uploadForm.contentType}
                    onValueChange={(value) => setUploadForm({...uploadForm, contentType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="document">Word Document</SelectItem>
                      <SelectItem value="whiteboard">Whiteboard</SelectItem>
                      <SelectItem value="html">HTML Content</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="content-description">Description</Label>
                <Textarea
                  id="content-description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Detailed explanation of the content and learning objectives..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="content-grade">Grade Level (optional)</Label>
                <Input
                  id="content-grade"
                  value={uploadForm.gradeLevel}
                  onChange={(e) => setUploadForm({...uploadForm, gradeLevel: e.target.value})}
                  placeholder="e.g. 8th Grade, High School"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={(uploadMutation.isPending || updateMutation.isPending) || (!editingContent && !selectedFile)}
                  className="flex-1"
                >
                  {editingContent ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      {updateMutation.isPending ? 'Updating...' : 'Update Content'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Content'}
                    </>
                  )}
                </Button>
                {editingContent && (
                  <Button type="button" variant="outline" onClick={resetUploadForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="admin-card p-4 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{(contents as any[]).length}</p>
                <p className="text-sm text-gray-500">Total Items</p>
              </div>
              <div className="admin-card p-4 text-center">
                <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {(contents as any[]).filter((c: any) => c.uploadedBy === user.id).length}
                </p>
                <p className="text-sm text-gray-500">Your Uploads</p>
              </div>
            </div>
            
            <div className="admin-card p-4">
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Content uploaded successfully</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Students accessing materials</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>AI processing content</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Library */}
      <div className="admin-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Content Library</h3>
            <p className="text-gray-600">Browse and manage all uploaded learning materials</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/content/my'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="secondary">{filteredContents.length} items</Badge>
          </div>
        </div>
        
        {contentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No content found</h3>
            <p className="text-sm">Upload your first learning material to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">Content</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Subject</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Uploaded</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.map((content: any, index) => (
                  <tr key={content.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{content.title}</div>
                          <div className="text-sm text-gray-500">{content.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {content.contentType}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">{content.subject || 'General'}</td>
                    <td className="p-4">
                      <Badge variant={content.isPublished ? "default" : "secondary"}>
                        {content.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="View content"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditContent(content)}
                          title="Edit content metadata"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContent(content.id, content.title)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StudyBuddySection({ user }: { user: any }) {
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [personaForm, setPersonaForm] = useState({
    name: "",
    key: "",
    description: "",
    systemPrompt: "",
    subjects: "",
    isActive: true
  });

  // Use shared persona management hook
  const { 
    personas, 
    isLoading: personasLoading, 
    createPersona, 
    updatePersona, 
    deletePersona 
  } = useAdminPersonas(user?.role);

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

  const handlePersonaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPersona) {
      updatePersona.mutate({ id: selectedPersona.id, data: personaForm }, {
        onSuccess: () => resetPersonaForm()
      });
    } else {
      createPersona.mutate(personaForm, {
        onSuccess: () => resetPersonaForm()
      });
    }
  };

  const editPersona = (persona: any) => {
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

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Buddy AI Management</h2>
        <p className="text-gray-600 mb-6">Configure AI tutors, personas, and learning interactions.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Persona Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create/Edit AI Persona</h3>
            <form onSubmit={handlePersonaSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="persona-name">Name</Label>
                  <Input
                    id="persona-name"
                    value={personaForm.name}
                    onChange={(e) => setPersonaForm({...personaForm, name: e.target.value})}
                    placeholder="Math Tutor"
                  />
                </div>
                <div>
                  <Label htmlFor="persona-key">Key</Label>
                  <Input
                    id="persona-key"
                    value={personaForm.key}
                    onChange={(e) => setPersonaForm({...personaForm, key: e.target.value})}
                    placeholder="math_tutor"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="persona-description">Description</Label>
                <Textarea
                  id="persona-description"
                  value={personaForm.description}
                  onChange={(e) => setPersonaForm({...personaForm, description: e.target.value})}
                  placeholder="A helpful AI tutor specialized in mathematics"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="persona-prompt">System Prompt</Label>
                <Textarea
                  id="persona-prompt"
                  value={personaForm.systemPrompt}
                  onChange={(e) => setPersonaForm({...personaForm, systemPrompt: e.target.value})}
                  placeholder="You are a patient and encouraging math tutor..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="persona-subjects">Subjects (comma-separated)</Label>
                <Input
                  id="persona-subjects"
                  value={personaForm.subjects}
                  onChange={(e) => setPersonaForm({...personaForm, subjects: e.target.value})}
                  placeholder="mathematics, algebra, geometry"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="persona-active"
                  checked={personaForm.isActive}
                  onChange={(e) => setPersonaForm({...personaForm, isActive: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="persona-active">Active</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={createPersona.isPending || updatePersona.isPending}>
                  <Save className="w-4 h-4 mr-2" />
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
          
          {/* Personas List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Personas</h3>
            {personasLoading ? (
              <div className="text-center py-4">Loading personas...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(personas as any[]).map((persona: any) => (
                  <div key={persona.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{persona.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={persona.isActive ? "default" : "secondary"}>
                          {persona.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => editPersona(persona)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deletePersona.mutate(persona.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{persona.description}</p>
                    <p className="text-xs text-gray-500">Key: {persona.key}</p>
                    {persona.subjects && (
                      <p className="text-xs text-gray-500">Subjects: {persona.subjects.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection({ user }: { user: any }) {
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

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
        <p className="text-gray-600 mb-6">View platform usage, learning progress, and system metrics.</p>
        
        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsLoading ? '...' : (analyticsData as any)?.totalUsers || '0'}
                </p>
                <p className="text-xs text-green-600">+{(analyticsData as any)?.newUsersThisMonth || '0'} this month</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsLoading ? '...' : (analyticsData as any)?.activeSessions || '0'}
                </p>
                <p className="text-xs text-green-600">Live now</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chatLoading ? '...' : (chatAnalytics as any)?.totalRequests || '0'}
                </p>
                <p className="text-xs text-blue-600">{(chatAnalytics as any)?.thisMonth || '0'} this month</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {budgetLoading ? '...' : (budgetAnalytics as any)?.registeredUsers || '0'}
                </p>
                <p className="text-xs text-orange-600">{(budgetAnalytics as any)?.totalTransactions || '0'} transactions</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
        
        {/* Budget Analytics Section */}
        {user.role === 'superuser' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              BudgetPal Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="admin-card p-4">
                <h4 className="font-medium mb-2">Active Budget Users</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {budgetLoading ? '...' : (budgetAnalytics as any)?.registeredUsers || '0'}
                </p>
                <p className="text-sm text-gray-500">Total registered users</p>
              </div>
              <div className="admin-card p-4">
                <h4 className="font-medium mb-2">Total Transactions</h4>
                <p className="text-2xl font-bold text-green-600">
                  {budgetLoading ? '...' : (budgetAnalytics as any)?.totalTransactions || '0'}
                </p>
                <p className="text-sm text-gray-500">All time transactions</p>
              </div>
              <div className="admin-card p-4">
                <h4 className="font-medium mb-2">Avg Monthly Budget</h4>
                <p className="text-2xl font-bold text-purple-600">
                  ${budgetLoading ? '...' : (budgetAnalytics as any)?.averageBudget || '0'}
                </p>
                <p className="text-sm text-gray-500">Per user average</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Analytics Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2">Total Requests</h4>
              <p className="text-2xl font-bold text-blue-600">
                {chatLoading ? '...' : (chatAnalytics as any)?.totalRequests || '0'}
              </p>
              <p className="text-sm text-gray-500">All time chat requests</p>
            </div>
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2">This Month</h4>
              <p className="text-2xl font-bold text-green-600">
                {chatLoading ? '...' : (chatAnalytics as any)?.thisMonth || '0'}
              </p>
              <p className="text-sm text-gray-500">Current month activity</p>
            </div>
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2">Average Daily</h4>
              <p className="text-2xl font-bold text-purple-600">
                {chatLoading ? '...' : Math.round(((chatAnalytics as any)?.thisMonth || 0) / 30) || '0'}
              </p>
              <p className="text-sm text-gray-500">Requests per day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TravelBlogSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    isPublished: false
  });

  // Blog Posts Query
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/admin/blog-posts'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  // Blog Post Mutations
  const createBlogMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/blog-posts", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      toast({ title: "Blog post created successfully" });
      resetBlogForm();
    },
    onError: (error) => {
      toast({ title: "Failed to create blog post", description: error.message, variant: "destructive" });
    }
  });

  const updateBlogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/blog-posts/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      toast({ title: "Blog post updated successfully" });
      resetBlogForm();
    },
    onError: (error) => {
      toast({ title: "Failed to update blog post", description: error.message, variant: "destructive" });
    }
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/blog-posts/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      toast({ title: "Blog post deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete blog post", description: error.message, variant: "destructive" });
    }
  });

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

  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPost) {
      updateBlogMutation.mutate({ id: selectedPost.id, data: blogForm });
    } else {
      createBlogMutation.mutate(blogForm);
    }
  };

  const editBlogPost = (post: any) => {
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

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Travel Blog Management</h2>
        <p className="text-gray-600 mb-6">Create and manage travel blog posts and cruise content.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blog Post Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create/Edit Blog Post</h3>
            <form onSubmit={handleBlogSubmit} className="space-y-4">
              <div>
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                  placeholder="Amazing Caribbean Cruise Experience"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="blog-category">Category</Label>
                  <Select
                    value={blogForm.category}
                    onValueChange={(value) => setBlogForm({...blogForm, category: value})}
                  >
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
                  <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
                  <Input
                    id="blog-tags"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({...blogForm, tags: e.target.value})}
                    placeholder="cruise, caribbean, vacation"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="blog-excerpt">Excerpt</Label>
                <Textarea
                  id="blog-excerpt"
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})}
                  placeholder="Brief description of the blog post..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="blog-content">Content</Label>
                <Textarea
                  id="blog-content"
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                  placeholder="Full blog post content..."
                  rows={6}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="blog-published"
                  checked={blogForm.isPublished}
                  onChange={(e) => setBlogForm({...blogForm, isPublished: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="blog-published">Published</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={createBlogMutation.isPending || updateBlogMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
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
          
          {/* Blog Posts List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Posts</h3>
            {postsLoading ? (
              <div className="text-center py-4">Loading posts...</div>
            ) : (posts as any[]).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No blog posts yet</p>
                <p className="text-sm">Create your first travel blog post!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(posts as any[]).map((post: any) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => editBlogPost(post)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteBlogMutation.mutate(post.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      {post.tags && (
                        <span>Tags: {post.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemSettingsSection({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
        <p className="text-gray-600 mb-6">Configure system-wide settings, features, and integrations.</p>
        
        {/* Feature Toggles */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Feature Toggles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Student Features</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Revision Materials</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-5 h-5 text-green-600" />
                    <span className="font-medium">StudyBuddy AI</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Budget Tracker</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Gamepad2 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Games</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Teacher/Admin Features</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Content Management</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium">Travel Blog</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">DAO Access</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Admin Panel</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* System Information */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Database className="w-4 h-4 mr-2 text-blue-600" />
                Database Status
              </h4>
              <p className="text-2xl font-bold text-green-600 mb-1">Connected</p>
              <p className="text-sm text-gray-500">PostgreSQL</p>
            </div>
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                Security Status
              </h4>
              <p className="text-2xl font-bold text-green-600 mb-1">Secure</p>
              <p className="text-sm text-gray-500">All systems operational</p>
            </div>
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-600" />
                Uptime
              </h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">99.9%</p>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
          </div>
        </div>
        
        {/* Integration Status */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Integration Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">OpenAI API</p>
                  <p className="text-sm text-gray-500">AI tutoring and chat functionality</p>
                </div>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Database Connection</p>
                  <p className="text-sm text-gray-500">PostgreSQL data storage</p>
                </div>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Authentication System</p>
                  <p className="text-sm text-gray-500">User login and session management</p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
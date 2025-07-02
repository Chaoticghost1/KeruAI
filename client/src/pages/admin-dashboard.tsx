import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Content creation form state
  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    contentType: "",
    subject: "",
    gradeLevel: "",
    tags: "",
    htmlContent: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // System features state
  const [systemFeatures, setSystemFeatures] = useState({
    studyBuddy: true,
    budgetTracker: true,
    contentSubmission: true,
    userRegistration: true,
    guestAccess: true,
    tutorSessions: true
  });

  // Load users on mount (superadmin only)
  useEffect(() => {
    if (user?.role === 'superuser') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast({
          title: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
          description: "User status has been updated"
        });
        loadUsers();
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      toast({
        title: "Error updating user status",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: number, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ role })
      });

      if (response.ok) {
        toast({
          title: "User role updated successfully",
          description: `User role changed to ${role}`
        });
        loadUsers();
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      toast({
        title: "Error updating user role",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const verifyUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        toast({
          title: "User verified successfully",
          description: "User can now access all features"
        });
        loadUsers();
      } else {
        throw new Error('Failed to verify user');
      }
    } catch (error) {
      toast({
        title: "Error verifying user",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const updateSystemFeature = async (feature: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/system/features', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ feature, enabled })
      });

      if (response.ok) {
        setSystemFeatures(prev => ({ ...prev, [feature]: enabled }));
        toast({
          title: "System feature updated",
          description: `${feature} has been ${enabled ? 'enabled' : 'disabled'}`
        });
      } else {
        throw new Error('Failed to update system feature');
      }
    } catch (error) {
      toast({
        title: "Error updating system feature",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', contentForm.title);
    formData.append('description', contentForm.description);
    formData.append('contentType', contentForm.contentType);
    formData.append('subject', contentForm.subject);
    formData.append('gradeLevel', contentForm.gradeLevel);
    formData.append('tags', JSON.stringify(contentForm.tags.split(',').map(t => t.trim())));
    formData.append('htmlContent', contentForm.htmlContent);
    
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Content created successfully",
          description: "Your content has been submitted for review"
        });
        
        // Reset form
        setContentForm({
          title: "",
          description: "",
          contentType: "",
          subject: "",
          gradeLevel: "",
          tags: "",
          htmlContent: ""
        });
        setSelectedFile(null);
      } else {
        throw new Error('Failed to create content');
      }
    } catch (error) {
      toast({
        title: "Error creating content",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const updateContentForm = (field: string, value: string) => {
    setContentForm(prev => ({ ...prev, [field]: value }));
  };

  const DashboardOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content Items</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">456</div>
          <p className="text-xs text-muted-foreground">+12.5% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">89</div>
          <p className="text-xs text-muted-foreground">+5.7% from last hour</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">94.2%</div>
          <p className="text-xs text-muted-foreground">+2.1% from last week</p>
        </CardContent>
      </Card>
    </div>
  );

  const UserManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage all platform users, their roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'student').length}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'teacher').length}</div>
                    <div className="text-sm text-muted-foreground">Teachers</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'superuser').length}</div>
                    <div className="text-sm text-muted-foreground">Superadmins</div>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-semibold">All Users</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {users.map((userItem) => (
                    <div key={userItem.id} className="p-4 border-b last:border-b-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{userItem.username}</div>
                          <div className="text-sm text-muted-foreground">{userItem.email || 'No email'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={userItem.role === 'superuser' ? 'default' : userItem.role === 'teacher' ? 'secondary' : 'outline'}>
                          {userItem.role}
                        </Badge>
                        <Badge variant={userItem.isVerified ? 'default' : 'destructive'}>
                          {userItem.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Badge variant={userItem.isActive ? 'default' : 'destructive'}>
                          {userItem.isActive ? 'Active' : 'Blocked'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(userItem);
                              setUserModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={userItem.isActive ? "destructive" : "default"}
                            onClick={() => updateUserStatus(userItem.id, !userItem.isActive)}
                          >
                            {userItem.isActive ? 'Block' : 'Unblock'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Edit Modal */}
      {userModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit User: {selectedUser.username}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(role) => updateUserRole(selectedUser.id, role)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="superuser">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Verified Status</Label>
                <Button
                  size="sm"
                  variant={selectedUser.isVerified ? "outline" : "default"}
                  onClick={() => !selectedUser.isVerified && verifyUser(selectedUser.id)}
                  disabled={selectedUser.isVerified}
                >
                  {selectedUser.isVerified ? 'Already Verified' : 'Verify User'}
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setUserModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const SystemSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Feature Controls
        </CardTitle>
        <CardDescription>
          Enable or disable platform features for security and development purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(systemFeatures).map(([feature, enabled]) => (
          <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium capitalize">
                {feature.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-sm text-muted-foreground">
                {feature === 'studyBuddy' && 'AI tutoring system with interactive learning'}
                {feature === 'budgetTracker' && 'Personal finance management tools'}
                {feature === 'contentSubmission' && 'Teacher content upload and sharing'}
                {feature === 'userRegistration' && 'New user account creation'}
                {feature === 'guestAccess' && 'Unverified user access to features'}
                {feature === 'tutorSessions' && 'AI tutor conversation sessions'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={enabled ? 'default' : 'destructive'}>
                {enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Button
                size="sm"
                variant={enabled ? "destructive" : "default"}
                onClick={() => updateSystemFeature(feature, !enabled)}
              >
                {enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        ))}

        <Alert className="mt-6">
          <AlertDescription>
            <strong>Security Note:</strong> Disabling features will immediately affect all users. 
            Use with caution during production hours.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const ContentCreationForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Create New Content
        </CardTitle>
        <CardDescription>
          Submit educational content for students to work on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleContentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={contentForm.title}
                onChange={(e) => updateContentForm("title", e.target.value)}
                placeholder="Enter content title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type *</Label>
              <Select value={contentForm.contentType} onValueChange={(value) => updateContentForm("contentType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="whiteboard">Whiteboard</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="html">Web Content (HTML)</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={contentForm.subject} onValueChange={(value) => updateContentForm("subject", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="geography">Geography</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="physical-education">Physical Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Select value={contentForm.gradeLevel} onValueChange={(value) => updateContentForm("gradeLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary (K-5)</SelectItem>
                  <SelectItem value="middle">Middle School (6-8)</SelectItem>
                  <SelectItem value="high">High School (9-12)</SelectItem>
                  <SelectItem value="college">College/University</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={contentForm.description}
              onChange={(e) => updateContentForm("description", e.target.value)}
              placeholder="Describe the content and what students should do with it"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={contentForm.tags}
              onChange={(e) => updateContentForm("tags", e.target.value)}
              placeholder="homework, worksheet, practice, exam"
            />
          </div>

          {contentForm.contentType === 'html' && (
            <div className="space-y-2">
              <Label htmlFor="htmlContent">HTML Content</Label>
              <Textarea
                id="htmlContent"
                value={contentForm.htmlContent}
                onChange={(e) => updateContentForm("htmlContent", e.target.value)}
                placeholder="Enter HTML content directly"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          )}

          {contentForm.contentType && contentForm.contentType !== 'html' && (
            <div className="space-y-2">
              <Label htmlFor="file">Upload File *</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept={
                  contentForm.contentType === 'image' ? 'image/*' :
                  contentForm.contentType === 'pdf' ? '.pdf' :
                  contentForm.contentType === 'video' ? 'video/*' :
                  '*'
                }
                required={contentForm.contentType !== 'html'}
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === 'superuser' ? 'Admin Dashboard' : 'Teacher Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || user?.username}!
            <Badge variant="secondary" className="ml-2">{user?.role}</Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user?.isVerified ? "default" : "destructive"}>
            {user?.isVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full ${user?.role === 'superuser' ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          {user?.role === 'superuser' && (
            <TabsTrigger value="user-management" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
          )}
          <TabsTrigger value="users" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            {user?.role === 'superuser' ? 'My Profile' : 'Students'}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DashboardOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">New student registered: Alex Johnson</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Content published: Math Worksheet #5</span>
                    <span className="text-xs text-muted-foreground ml-auto">15 min ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Assignment submitted by Emma Davis</span>
                    <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Content
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Assign Work to Students
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Submissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <ContentCreationForm />
          
          <Card>
            <CardHeader>
              <CardTitle>My Content</CardTitle>
              <CardDescription>Manage your educational content submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4" />
                <p>No content created yet. Use the form above to create your first piece of educational content.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'superuser' && (
          <TabsContent value="user-management" className="space-y-4">
            <UserManagement />
          </TabsContent>
        )}

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{user?.role === 'superuser' ? 'My Profile' : 'Student Management'}</CardTitle>
              <CardDescription>
                {user?.role === 'superuser' ? 'View your account information' : 'View and manage student progress'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.role === 'superuser' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input value={user?.username} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || 'Not provided'} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={user?.role} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Input value={user?.isVerified ? 'Verified' : 'Unverified'} disabled />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4" />
                  <p>Student management features coming soon.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {user?.role === 'superuser' ? (
            <SystemSettings />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input value={user?.username} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || 'Not provided'} disabled />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      Account settings and profile updates will be available in the next update.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
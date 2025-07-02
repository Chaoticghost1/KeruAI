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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
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

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                {user?.role === 'superuser' ? 'Manage all platform users' : 'View student progress'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>User management features coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
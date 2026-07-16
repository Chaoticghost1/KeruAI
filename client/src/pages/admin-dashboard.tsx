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
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  User,
  Handshake,
  ExternalLink,
  Copy,
  Archive,
  ShieldAlert,
  BookMarked
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAdminPersonas } from "@/hooks/use-personas";
import { useLanguage } from "@/contexts/LanguageContext";
import ClassGroups from "@/pages/ClassGroups";

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const hashSection = typeof window !== 'undefined' ? (window.location.hash?.slice(1) || '') : '';
  const [activeSection, setActiveSection] = useState(() => {
    if (hashSection && ['overview', 'content', 'classes', 'mentor-applications', 'mentor-materials', 'users', 'submissions', 'assignments', 'study-buddy', 'chat-archives', 'analytics', 'travel-blog', 'settings'].includes(hashSection)) {
      return hashSection;
    }
    return "overview";
  });
  const [openAdminGroups, setOpenAdminGroups] = useState<Record<string, boolean>>({
    content: true,
    mentorship: true,
    platform: true,
  });

  useEffect(() => {
    if (hashSection && hashSection !== activeSection) {
      setActiveSection(hashSection);
    }
  }, [hashSection]);

  const setActiveSectionWithHash = (section: string) => {
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${section}`);
    }
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

  const navGroups: { id: string; label?: string; items: { id: string; label: string; icon: any; superuserOnly?: boolean }[] }[] = [
    {
      id: "overview",
      label: undefined,
      items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }],
    },
     {
       id: "content",
       label: "Content & Learning",
       items: [
         { id: "content", label: t.admin?.contentManagement ?? "Content Management", icon: FileText },
         { id: "assignments", label: t.admin?.studentAssignments ?? "Student Assignments", icon: BookMarked },
         { id: "submissions", label: t.admin?.allContentReadOnly ?? "All content (read-only)", icon: FileText },
         { id: "classes", label: "Clases y Grupos", icon: GraduationCap },
         { id: "study-buddy", label: "Study Buddy AI", icon: Bot },
       ].filter((item) => !('superuserOnly' in item) || ['superuser', 'teacher'].includes(user.role)),
     },
    {
      id: "mentorship",
      label: "Mentorship",
      items: [
        { id: "mentor-applications", label: "Mentor Applications", icon: Handshake, superuserOnly: true },
        { id: "mentor-materials", label: "Mentor Materials", icon: BookOpen },
      ].filter((item) => !('superuserOnly' in item) || user.role === 'superuser'),
    },
    {
      id: "platform",
      label: "Platform",
      items: [
        { id: "users", label: "User Management", icon: Users, superuserOnly: true },
        { id: "chat-archives", label: "Chat Archives", icon: Archive, superuserOnly: true },
        { id: "travel-blog", label: "Travel Blog", icon: Globe, superuserOnly: true },
        { id: "analytics", label: "Analytics", icon: BarChart3, superuserOnly: true },
        { id: "settings", label: "System Settings", icon: Settings, superuserOnly: true },
      ].filter((item) => !('superuserOnly' in item) || user.role === 'superuser'),
    },
  ];

  const allNavItems = navGroups.flatMap((g) => ('items' in g ? g.items : [g]));
  const filteredNavItems = allNavItems;

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
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navGroups.map((group) => {
              const hasMultiple = group.items.length > 1;
              const isGroupOpen = openAdminGroups[group.id] ?? true;
              if (hasMultiple && group.label) {
                return (
                  <Collapsible
                    key={group.id}
                    open={isGroupOpen}
                    onOpenChange={(open) => setOpenAdminGroups((s) => ({ ...s, [group.id]: open }))}
                  >
                    <CollapsibleTrigger className="admin-nav-item w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-300">
                      {group.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-2 mt-1 space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.id;
                          return (
                            <button
                              key={item.id}
onClick={() => setActiveSection(item.id)}
                              className={`admin-nav-item w-full flex items-center px-3 py-2.5 text-sm font-medium text-left rounded ${
                                isActive ? 'active bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                              }`}
                            >
                              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                              {item.label}
                              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return group.items.map((item) => {
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
              });
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
          {activeSection === "overview" && <OverviewSection user={user} setActiveSection={setActiveSectionWithHash} />}
          {activeSection === "content" && <ContentManagementSection user={user} />}
          {activeSection === "classes" && <ClassGroups />}
          {activeSection === "mentor-applications" && user.role === 'superuser' && <MentorApplicationsSection user={user} />}
          {activeSection === "mentor-materials" && <MentorMaterialsSection user={user} />}
          {activeSection === "users" && <UserManagementSection user={user} />}
          {activeSection === "submissions" && <SubmissionsSection user={user} />}
          {activeSection === "assignments" && <AssignmentsSection user={user} />}
          {activeSection === "chat-archives" && user.role === 'superuser' && <ChatArchivesSection />}
          {activeSection === "study-buddy" && <StudyBuddySection user={user} />}
          {activeSection === "analytics" && <AnalyticsSection user={user} />}
          {activeSection === "travel-blog" && <TravelBlogSection user={user} />}
          {activeSection === "settings" && <SystemSettingsSection user={user} />}
        </main>
      </div>
    </div>
  );
}

// Chat Archives Section (superuser only) - archives of classes deleted by teachers
type ClassChatArchiveRow = {
  id: number;
  originalClassId: number;
  className: string;
  teacherId: number;
  subject: string | null;
  inviteCode: string;
  status: string;
  archivedAt: string;
  archivedByUserId: number;
  messagesSnapshot: { senderId: number; message: string; createdAt: string; senderName?: string }[];
  membersSnapshot: { userId: number; role: string; status: string; displayName?: string }[];
};

const ARCHIVES_PAGE_SIZE = 10;

function ChatArchivesSection() {
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null);
  const [archivesPage, setArchivesPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [archiveSearch, setArchiveSearch] = useState("");
  const { data: archivesResponse, isLoading } = useQuery<{ data?: ClassChatArchiveRow[]; total?: number } | ClassChatArchiveRow[]>({
    queryKey: ["/api/admin/class-chat-archives", archivesPage, archiveSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(ARCHIVES_PAGE_SIZE),
        offset: String((archivesPage - 1) * ARCHIVES_PAGE_SIZE),
      });
      if (archiveSearch.trim()) params.set("search", archiveSearch.trim());
      const res = await apiRequest("GET", `/api/admin/class-chat-archives?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load archives");
      return res.json();
    },
  });
  // Support both paginated { data, total } and legacy array response
  const archives: ClassChatArchiveRow[] = Array.isArray(archivesResponse)
    ? archivesResponse
    : (archivesResponse?.data ?? []);
  const totalArchives = Array.isArray(archivesResponse)
    ? archivesResponse.length
    : (archivesResponse?.total ?? 0);
  const totalArchivesPages = Math.max(1, Math.ceil(totalArchives / ARCHIVES_PAGE_SIZE));
  const { data: selectedArchive, isLoading: loadingDetail } = useQuery<ClassChatArchiveRow | null>({
    queryKey: ["/api/admin/class-chat-archives", selectedArchiveId],
    queryFn: async () => {
      if (!selectedArchiveId) return null;
      const res = await apiRequest("GET", `/api/admin/class-chat-archives/${selectedArchiveId}`);
      if (!res.ok) throw new Error("Failed to load archive");
      return res.json();
    },
    enabled: !!selectedArchiveId,
  });

  const runArchiveSearch = () => {
    setArchiveSearch(searchInput.trim());
    setArchivesPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Archive className="w-6 h-6" />
          Chat Archives
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Superadmin only. Snapshot of every deleted class (superadmin: any class; teacher: empty classes only). Search by class name or invite code.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by class name or invite code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runArchiveSearch()}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={runArchiveSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {archiveSearch && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchInput(""); setArchiveSearch(""); setArchivesPage(1); }}>
              Clear
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : archives.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{archiveSearch ? "No archives match your search." : "No archived class chats yet."}</p>
            <p className="text-sm mt-1">{archiveSearch ? "Try a different search or clear the filter." : "Archives are created when a class is deleted (superadmin: any class; teacher: empty classes only)."}</p>
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Class</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Invite code</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Archived at</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Messages</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {archives.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">{a.className}</td>
                      <td className="py-3 px-2 font-mono">{a.inviteCode}</td>
                      <td className="py-3 px-2 text-gray-600">{new Date(a.archivedAt).toLocaleString()}</td>
                      <td className="py-3 px-2">{(a.messagesSnapshot?.length ?? 0)}</td>
                      <td className="py-3 px-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedArchiveId(a.id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalArchivesPages > 1 && (
              <div className="mt-4 flex justify-center border-t pt-4">
                <Pagination>
                  <PaginationContent className="flex items-center gap-2">
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArchivesPage((p) => Math.max(1, p - 1))}
                        disabled={archivesPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 py-2 text-sm text-gray-600">
                        Page {archivesPage} of {totalArchivesPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArchivesPage((p) => Math.min(totalArchivesPages, p + 1))}
                        disabled={archivesPage >= totalArchivesPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selectedArchiveId} onOpenChange={(open) => !open && setSelectedArchiveId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Archived class chat</DialogTitle>
            <DialogDescription>
              Snapshot at deletion. Only super admins can view this.
            </DialogDescription>
          </DialogHeader>
          {loadingDetail || !selectedArchive ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4 flex-1 min-h-0 flex flex-col">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="font-medium text-gray-600">Class:</span> {selectedArchive.className}</p>
                <p><span className="font-medium text-gray-600">Invite code:</span> <code className="font-mono">{selectedArchive.inviteCode}</code></p>
                <p><span className="font-medium text-gray-600">Archived at:</span> {new Date(selectedArchive.archivedAt).toLocaleString()}</p>
                <p><span className="font-medium text-gray-600">Original class ID:</span> {selectedArchive.originalClassId}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Messages ({selectedArchive.messagesSnapshot?.length ?? 0})</h4>
                <ScrollArea className="h-[280px] rounded-md border p-3">
                  <div className="space-y-2">
                    {(selectedArchive.messagesSnapshot?.length ? selectedArchive.messagesSnapshot : []).map((m, i) => (
                      <div key={i} className="text-sm border-l-2 border-gray-200 pl-2 py-1">
                        <span className="font-medium text-gray-700">{m.senderName ?? `User ${m.senderId}`}</span>
                        <span className="text-gray-500 text-xs ml-2">{new Date(m.createdAt).toLocaleString()}</span>
                        <p className="mt-0.5 whitespace-pre-wrap">{m.message}</p>
                      </div>
                    ))}
                    {(!selectedArchive.messagesSnapshot?.length) && (
                      <p className="text-gray-500 text-sm">No messages (empty class).</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              {selectedArchive.membersSnapshot?.length ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Members at deletion ({selectedArchive.membersSnapshot.length})</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedArchive.membersSnapshot.map((mem, i) => (
                      <li key={i}>{mem.displayName ?? `User ${mem.userId}`} — {mem.role} ({mem.status})</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
      value: (analyticsData as any)?.systemHealth || "N/A",
      change: "Status from server",
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
            onClick={() => setActiveSection("content")}
            data-testid="quick-action-content"
          >
            <PlusCircle className="w-4 h-4 mr-3" />
            Create New Content
          </Button>
          {user.role === 'superuser' && (
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setActiveSection("users")}
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
              onClick={() => setActiveSection("analytics")}
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
              onClick={() => setActiveSection("settings")}
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

const MENTOR_APPLICATIONS_PAGE_SIZE = 10;

// Mentor Applications Section
function MentorApplicationsSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [appPage, setAppPage] = useState(1);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [createAccount, setCreateAccount] = useState(true);

  const { data: applicationsResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/mentor-applications", statusFilter, appPage],
    queryFn: async () => {
      const params = new URLSearchParams({ status: statusFilter, limit: String(MENTOR_APPLICATIONS_PAGE_SIZE), offset: String((appPage - 1) * MENTOR_APPLICATIONS_PAGE_SIZE) });
      const res = await apiRequest("GET", `/api/admin/mentor-applications?${params.toString()}`);
      return res.json();
    },
    enabled: !!user?.role && user.role === "superuser",
  });
  const applications = Array.isArray(applicationsResponse?.data) ? applicationsResponse.data : [];
  const totalApplications = applicationsResponse?.total ?? 0;
  const totalAppPages = Math.max(1, Math.ceil(totalApplications / MENTOR_APPLICATIONS_PAGE_SIZE));

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const res = await apiRequest("PATCH", `/api/admin/mentor-applications/${id}`, {
        status,
        adminNotes,
        createAccount: status === "approved" ? createAccount : undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mentor-applications"] });
      if (data.tempPassword) {
        toast({
          title: "Application approved. Share login with applicant:",
          description: `Username: ${data.email?.split("@")[0] || "check email"} | Temp password: ${data.tempPassword}`,
          duration: 15000,
        });
      } else {
        toast({ title: "Application updated" });
      }
      setReviewingId(null);
      setAdminNotes("");
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Mentor Applications</h2>
        <p className="text-gray-600 mb-4">
          Review credentials and diplomas. Pre-approve mentors to create accounts and mentor profiles.
        </p>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setAppPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-2">{totalApplications} total</Badge>
      </div>
      {isLoading ? (
        <div className="admin-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="admin-card p-8 text-center text-gray-500">No applications found.</div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => (
            <div key={app.id} className="admin-card p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.fullName}</h3>
                  <p className="text-sm text-gray-500">{app.email}</p>
                  {app.phone && <p className="text-sm text-gray-500">{app.phone}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(app.subjects || []).map((s: string) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                  {app.credentials && <p className="text-sm mt-2 text-gray-600">{app.credentials}</p>}
                  {app.experience && <p className="text-sm text-gray-600">{app.experience}</p>}
                </div>
                <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                  {app.status}
                </Badge>
              </div>
              {app.status === "pending" && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <Textarea
                    placeholder="Admin notes (optional)"
                    value={reviewingId === app.id ? adminNotes : ""}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    onFocus={() => setReviewingId(app.id)}
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`create-${app.id}`}
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                      />
                      <label htmlFor={`create-${app.id}`} className="text-sm">Create account on approve</label>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => approveMutation.mutate({ id: app.id, status: "rejected" })} disabled={approveMutation.isPending}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => approveMutation.mutate({ id: app.id, status: "approved" })} disabled={approveMutation.isPending}>
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {totalAppPages > 1 && (
            <div className="pt-4 flex justify-center border-t">
              <Pagination>
                <PaginationContent className="flex items-center gap-2">
                  <PaginationItem>
                    <Button variant="outline" size="sm" onClick={() => setAppPage((p) => Math.max(1, p - 1))} disabled={appPage <= 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-3 py-2 text-sm text-gray-600">Page {appPage} of {totalAppPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button variant="outline" size="sm" onClick={() => setAppPage((p) => Math.min(totalAppPages, p + 1))} disabled={appPage >= totalAppPages}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mentor Materials Section
function MentorMaterialsSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending_review");

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["/api/admin/mentor-materials", statusFilter],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/mentor-materials?status=${statusFilter}`);
      return res.json();
    },
    enabled: !!user?.role && ["superuser", "teacher"].includes(user.role),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const res = await apiRequest("PATCH", `/api/admin/mentor-materials/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mentor-materials"] });
      toast({ title: "Material updated" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Mentor Materials</h2>
        <p className="text-gray-600 mb-4">
          Cross-check and approve teaching materials uploaded by mentors before they go live.
        </p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="admin-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading materials...</p>
        </div>
      ) : (materials as any[]).length === 0 ? (
        <div className="admin-card p-8 text-center text-gray-500">No materials found.</div>
      ) : (
        <div className="space-y-4">
          {(materials as any[]).map((m: any) => (
            <div key={m.id} className="admin-card p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{m.title}</h3>
                <p className="text-sm text-gray-500">{m.subject} • {m.contentType}</p>
                {m.teacherRecognized && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    TEACHER RECOGNIZED AND APPROVED MATERIAL
                  </span>
                )}
                {m.description && <p className="text-sm text-gray-600 mt-1">{m.description}</p>}
                {m.fileUrl && (
                  <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                    View file
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={m.status === "approved" ? "default" : m.status === "rejected" ? "destructive" : "secondary"}>
                  {m.status}
                </Badge>
                {m.status === "pending_review" && (
                  <>
                    <Button size="sm" variant="destructive" onClick={() => approveMutation.mutate({ id: m.id, status: "rejected" })} disabled={approveMutation.isPending}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => approveMutation.mutate({ id: m.id, status: "approved" })} disabled={approveMutation.isPending}>
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SUBMISSIONS_PAGE_SIZE = 10;
const ASSIGNMENTS_PAGE_SIZE = 10;

// Content Submissions Section (admin list with pagination)
function SubmissionsSection({ user }: { user: any }) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [publishedFilter, setPublishedFilter] = useState<string>("");
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/submissions', page, publishedFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(SUBMISSIONS_PAGE_SIZE),
        offset: String((page - 1) * SUBMISSIONS_PAGE_SIZE),
      });
      if (publishedFilter === "true") params.set("published", "true");
      if (publishedFilter === "false") params.set("published", "false");
      const res = await apiRequest("GET", `/api/admin/submissions?${params.toString()}`);
      return res.json();
    },
    enabled: !!user?.role && ["superuser", "teacher"].includes(user.role),
  });
  const submissions = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / SUBMISSIONS_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.admin?.allContentReadOnly ?? "All content (read-only)"}</h2>
        <p className="text-gray-600 mb-4">{t.admin?.allContentDescription ?? "View all uploaded content across the platform. To upload, edit, or assign materials to students, use Content Management."}</p>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Select value={publishedFilter || "all"} onValueChange={(v) => { setPublishedFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary">{total} total</Badge>
        </div>
        {isLoading ? (
          <p className="text-gray-500 py-4">Loading...</p>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Published</th>
                    <th className="text-left p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s: any) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3">{s.id}</td>
                      <td className="p-3 font-medium">{s.title}</td>
                      <td className="p-3">{s.subject}</td>
                      <td className="p-3">{s.contentType}</td>
                      <td className="p-3">{s.isPublished ? "Yes" : "No"}</td>
                      <td className="p-3 text-gray-500">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent className="flex items-center gap-2">
                    <PaginationItem>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Student Assignments Section (read-only list; assign only from Content Management)
function AssignmentsSection({ user }: { user: any }) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/assignments", page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(ASSIGNMENTS_PAGE_SIZE),
        offset: String((page - 1) * ASSIGNMENTS_PAGE_SIZE),
      });
      const res = await apiRequest("GET", `/api/admin/assignments?${params.toString()}`);
      return res.json();
    },
    enabled: !!user?.role && ["superuser", "teacher"].includes(user.role),
  });
  const assignments = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ASSIGNMENTS_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t.admin?.studentAssignments ?? "Student Assignments"}</h2>
            <p className="text-gray-600">{t.admin?.studentAssignmentsDesc ?? "List of who was assigned which content (students see these in Study Materials). To assign, use Assign to student(s) on each row in Content Management."}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{total} total</Badge>
          </div>
        </div>
        {isLoading ? (
          <p className="text-gray-500 py-4">Loading...</p>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Student ID</th>
                    <th className="text-left p-3">Content ID</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Grade</th>
                    <th className="text-left p-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a: any) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-3">{a.id}</td>
                      <td className="p-3">{a.studentId}</td>
                      <td className="p-3">{a.contentId}</td>
                      <td className="p-3">{a.status}</td>
                      <td className="p-3">{a.grade != null ? `${a.grade}` : "—"}</td>
                      <td className="p-3 text-gray-500">{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent className="flex items-center gap-2">
                    <PaginationItem>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const USERS_PAGE_SIZE = 10;

// User Management Section Component
function UserManagementSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch users with pagination (server-side search)
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', String(USERS_PAGE_SIZE));
      params.set('offset', String((page - 1) * USERS_PAGE_SIZE));
      if (searchTerm) params.set('search', searchTerm);
      const res = await apiRequest('GET', `/api/admin/users?${params.toString()}`);
      return res.json();
    },
    enabled: true,
  });

  const users = (usersResponse?.data ?? []) as any[];
  const totalUsers = usersResponse?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PAGE_SIZE));

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
    setPage(1);
  };

  // Mutations for user management (use apiRequest to include auth token)
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to update user role');
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
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/status`, { isActive });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to update user status');
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
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to delete user');
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

  const verifyUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/verify`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to approve user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User approved successfully. They can now upload content and create class groups." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to approve user", variant: "destructive" });
    }
  });

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
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })}
              data-testid="refresh-users"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="secondary">{totalUsers} users</Badge>
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
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-900">User</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Approved</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Created</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any, index: number) => (
                    <tr key={u.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                            <div className="text-sm text-gray-500">@{u.username}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Select value={u.role} onValueChange={(r) => handleRoleChange(u.id, r)} disabled={updateRoleMutation.isPending}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="superuser">Super User</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Badge variant={u.isActive ? "default" : "secondary"} className="text-xs">{u.isActive ? "Active" : "Inactive"}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleStatusToggle(u.id, u.isActive)} disabled={updateStatusMutation.isPending} data-testid={`toggle-user-status-${u.id}`} className="text-xs">{u.isActive ? "Deactivate" : "Activate"}</Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={u.isVerified ? "default" : "outline"} className="text-xs">{u.isVerified ? <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</span> : "Pending"}</Badge>
                          {!u.isVerified && (u.role === 'teacher' || u.role === 'student') && (
                            <Button variant="outline" size="sm" onClick={() => verifyUserMutation.mutate(u.id)} disabled={verifyUserMutation.isPending} data-testid={`approve-user-${u.id}`} className="text-xs text-green-600 border-green-600 hover:bg-green-50">Approve</Button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)} data-testid={`edit-user-${u.id}`}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} disabled={deleteUserMutation.isPending} className="text-red-600 hover:text-red-800" data-testid={`delete-user-${u.id}`}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="md:hidden space-y-3 p-4">
              {users.map((u: any) => (
                <div key={u.id} className="border rounded-lg p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{u.firstName} {u.lastName}</div>
                        <div className="text-sm text-gray-500 truncate">@{u.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} disabled={deleteUserMutation.isPending} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={u.role} onValueChange={(r) => handleRoleChange(u.id, r)} disabled={updateRoleMutation.isPending}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="superuser">Super User</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant={u.isActive ? "default" : "secondary"} className="text-xs">{u.isActive ? "Active" : "Inactive"}</Badge>
                    <Badge variant={u.isVerified ? "default" : "outline"} className="text-xs">{u.isVerified ? "Approved" : "Pending"}</Badge>
                    {!u.isVerified && (u.role === 'teacher' || u.role === 'student') && (
                      <Button variant="outline" size="sm" onClick={() => verifyUserMutation.mutate(u.id)} disabled={verifyUserMutation.isPending} className="text-xs text-green-600">Approve</Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleStatusToggle(u.id, u.isActive)} disabled={updateStatusMutation.isPending} className="text-xs">{u.isActive ? "Deactivate" : "Activate"}</Button>
                  </div>
                  <div className="text-xs text-gray-500">Created: {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t flex justify-center">
                <Pagination>
                  <PaginationContent className="flex items-center gap-2">
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 py-2 text-sm text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Content Management Section Component
function ContentManagementSection({ user }: { user: any }) {
  const { t } = useLanguage();
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
  const [assignDialogContent, setAssignDialogContent] = useState<{ id: number; title: string } | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Content Query
  const { data: contents = [], isLoading: contentsLoading } = useQuery({
    queryKey: ['/api/content/my'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });

  // Upload Mutation (send auth so teacher/superuser can upload)
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/content', {
        method: 'POST',
        headers,
        body: data
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to upload content');
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

  // Update Mutation (send auth)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers,
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

  // Delete Mutation (send auth)
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        headers
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
    onError: (error: any) => {
      toast({ title: "Failed to delete content", description: error.message, variant: "destructive" });
    }
  });

  // Publish Mutation (send auth)
  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/content/${id}/publish`, {
        method: 'POST',
        headers
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to publish content');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/my'] });
      toast({ title: "Content published successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to publish content", description: error.message, variant: "destructive" });
    }
  });

  // Students list for Assign dialog (teacher/superuser via /api/teachers/students)
  const { data: studentsResponse } = useQuery({
    queryKey: ["/api/teachers/students", 100, 0],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/teachers/students?limit=100&offset=0");
      return res.json();
    },
    enabled: !!assignDialogContent && (user?.role === "superuser" || user?.role === "teacher"),
  });
  const studentsForAssign = studentsResponse?.data ?? [];

  // Assign content to students
  const assignMutation = useMutation({
    mutationFn: async ({ contentId, studentIds }: { contentId: number; studentIds: number[] }) => {
      for (const studentId of studentIds) {
        const res = await apiRequest("POST", "/api/assignments", { studentId, contentId });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to assign to student ${studentId}`);
        }
      }
    },
    onSuccess: (_, { studentIds }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      toast({ title: "Assignment created", description: (t.admin?.assignToastSuccess ?? "Assigned to {n} student(s). They will see it in Study Materials if they have you as teacher and an approved class.").replace("{n}", String(studentIds.length)) });
      setAssignDialogContent(null);
      setSelectedStudentIds([]);
    },
    onError: (error: any) => {
      toast({ title: "Assign failed", description: error.message, variant: "destructive" });
    },
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
      {/* Workflow callout */}
      <div className="admin-card p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          {t.admin?.workflowCallout ?? "Study materials workflow: Your materials live here. Use Assign to student(s) on each row to give students access. Students see assigned items in Study Materials once they have you as a teacher and an approved class."}
        </p>
      </div>
      {/* Upload Section */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.admin?.contentManagementTitle ?? "Content Management"}</h2>
        <p className="text-gray-600 mb-6">{t.admin?.contentManagementDesc ?? "Upload and manage learning materials, PDFs, and educational resources. Assign to students so they appear in Study Materials."}</p>
        
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
                  {(contents as any[]).filter((c: any) => c.teacherId === user.id).length}
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
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
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
                        <Badge variant="outline" className="capitalize">{content.contentType}</Badge>
                      </td>
                      <td className="p-4 text-gray-600">{content.subject || 'General'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={content.isPublished ? "default" : "secondary"}>{content.isPublished ? "Published" : "Draft"}</Badge>
                          {!content.isPublished && (
                            <Button variant="outline" size="sm" onClick={() => publishMutation.mutate(content.id)} disabled={publishMutation.isPending} className="text-green-600 border-green-600 hover:bg-green-50">Publish</Button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{new Date(content.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" title="View content"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { setAssignDialogContent({ id: content.id, title: content.title }); setSelectedStudentIds([]); }} title={t.admin?.assignToStudents ?? "Assign to student(s)"}><BookMarked className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditContent(content)} title="Edit content metadata"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(content.id, content.title)} disabled={deleteMutation.isPending} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="md:hidden space-y-3 p-4">
              {filteredContents.map((content: any) => (
                <div key={content.id} className="border rounded-lg p-4 bg-white space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{content.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{content.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => { setAssignDialogContent({ id: content.id, title: content.title }); setSelectedStudentIds([]); }} title={t.admin?.assignToStudents ?? "Assign to student(s)"}><BookMarked className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditContent(content)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(content.id, content.title)} disabled={deleteMutation.isPending} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">{content.contentType}</Badge>
                    <Badge variant={content.isPublished ? "default" : "secondary"}>{content.isPublished ? "Published" : "Draft"}</Badge>
                    {!content.isPublished && (
                      <Button variant="outline" size="sm" onClick={() => publishMutation.mutate(content.id)} disabled={publishMutation.isPending} className="text-green-600 text-xs">Publish</Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Subject: {content.subject || 'General'} · {new Date(content.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Assign to student(s) dialog */}
      <Dialog open={!!assignDialogContent} onOpenChange={(open) => { if (!open) { setAssignDialogContent(null); setSelectedStudentIds([]); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin?.assignToStudents ?? "Assign to student(s)"}</DialogTitle>
            <DialogDescription>
              {assignDialogContent ? (
                (t.admin?.assignDialogDescription ?? '"{title}" will appear in Study Materials for selected students who have you in "Your teachers" (Class Groups) and are in an approved class.').replace("{title}", assignDialogContent.title)
              ) : (
                ""
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {studentsForAssign.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t.admin?.assignNoStudentsInClasses ?? "No students in your classes yet. Students join via your class invite code (Class Groups). Once they join, they appear here so you can assign them content."}
              </p>
            ) : (
              <ScrollArea className="h-64 rounded border p-2">
                <div className="space-y-2">
                  {studentsForAssign.map((s: any) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-gray-50">
                      <Checkbox
                        checked={selectedStudentIds.includes(s.id)}
                        onCheckedChange={(checked) => {
                          setSelectedStudentIds((prev) =>
                            checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                          );
                        }}
                      />
                      <span className="text-sm">{s.firstName || s.lastName ? `${s.firstName || ""} ${s.lastName || ""}`.trim() : s.username || s.email || `User ${s.id}`}</span>
                      {s.email && <span className="text-xs text-gray-500 truncate">{s.email}</span>}
                    </label>
                  ))}
                </div>
              </ScrollArea>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAssignDialogContent(null); setSelectedStudentIds([]); }}>{t.admin?.cancel ?? "Cancel"}</Button>
              <Button
                disabled={selectedStudentIds.length === 0 || assignMutation.isPending}
                onClick={() => assignDialogContent && assignMutation.mutate({ contentId: assignDialogContent.id, studentIds: selectedStudentIds })}
              >
                {assignMutation.isPending ? (t.admin?.assigning ?? "Assigning…") : (t.admin?.assignButton ?? "Assign to {n} student(s)").replace("{n}", String(selectedStudentIds.length))}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const KERU_PERSONA_PRESETS = [
  { key: "matematico_guia", name: "Matemático Guía", description: "Math Expert | Algebra, Geometry, Calculus, Statistics", subjects: "mathematics, algebra, geometry, calculus, statistics", systemPrompt: "Sos Matemático Guía, tutor de matemáticas. Guiás, no das respuestas. Frases: \"¿Qué observás en este problema?\", \"¿Cuál sería el primer paso?\", \"¿Recordás cómo resolvimos algo similar?\" REGLAS: JAMÁS dar respuesta directa. Guiar con preguntas. Ejemplos Honduras (mercados, construcción). Responde en español Honduras." },
  { key: "doctora_nova", name: "Doctora Nova", description: "Chemistry & Biology Expert | Natural Sciences", subjects: "biology, chemistry, life sciences, ecology", systemPrompt: "Sos Doctora Nova, tutora de química y biología. Guiás observación e hipótesis. Frases: \"¿Qué observás cuando...?\", \"¿Por qué creés que pasó eso?\", \"¿Qué predecís que sucedería si...?\" REGLAS: JAMÁS dar respuestas directas. Método científico: Observar → Hipótesis → Probar → Concluir. Ejemplos Honduras (ecosistemas, café). Responde en español Honduras." },
  { key: "profesor_pluma", name: "Profesor Pluma", description: "Literature & Languages Expert | Reading, Writing, Critical Thinking", subjects: "literature, reading, writing, language arts", systemPrompt: "Sos Profesor Pluma, tutor de literatura y lenguaje. Guiás lectura y escritura. Frases: \"¿Qué observás en el texto?\", \"¿Cuál es la idea principal?\", \"¿Cómo lo sabés (evidencia)?\" REGLAS: JAMÁS escribir por ellos. Preguntar idea principal, audiencia, organización. Nunca solo corregir gramática; enseñar pensamiento. Responde en español Honduras." },
  { key: "maestro_ciencias", name: "Maestro Ciencias", description: "Physics & STEM Expert | Physics, Earth Sciences, Astronomy", subjects: "physics, earth science, astronomy, technology", systemPrompt: "Sos Maestro Ciencias, tutor de física y STEM. Guiás problemas y sistemas. Frases: \"¿Qué fuerzas actuán aquí?\", \"¿Cómo fluye la energía en este sistema?\", \"¿Qué pasaría si...?\" REGLAS: JAMÁS resolver el problema. Identificar dado y desconocido, elegir concepto, guiar pasos. Ejemplos Honduras (energía, infraestructura). Responde en español Honduras." },
  { key: "maestro_civismo", name: "Maestro Civismo", description: "Honduran Law & Civics | Constitution, Rights, Labor Law", subjects: "civics, constitution, labor law, rights", systemPrompt: "Sos Maestro Civismo, tutor de Constitución y leyes de Honduras. Enseñás a LEER leyes, no asesoramiento legal. Frases: \"¿Qué dice exactamente el artículo?\", \"¿Cómo se aplica esto en la práctica?\", \"¿Qué derechos ves mencionados?\" REGLAS: JAMÁS dar asesoramiento legal personal. Guiar lectura, comprensión, derechos Y responsabilidades. Responde en español Honduras." },
  { key: "guia_informatica", name: "Guía Informática", description: "Computer Science & Technology | Programming, Algorithms, Digital Literacy", subjects: "programming, algorithms, digital literacy, web development", systemPrompt: "Sos Guía Informática, tutor de programación y tecnología. Guiás lógica antes que sintaxis. Frases: \"¿Cuál es el primer paso lógico?\", \"¿Qué patrón ves?\", \"¿Qué error esperabas y qué pasó realmente?\" REGLAS: JAMÁS dar código completo. Pseudocódigo primero, luego código. Debuggear guiando, no corrigiendo. Responde en español Honduras." },
];

/** Normalize subjects (array or string from API/DB) to a display string */
function formatPersonaSubjects(subjects: unknown): string {
  if (Array.isArray(subjects)) return subjects.join(', ');
  if (typeof subjects === 'string') return subjects;
  return '';
}

const PERSONA_PAGE_SIZE = 10;

function StudyBuddySection({ user }: { user: any }) {
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [personaPage, setPersonaPage] = useState(1);
  const [personaForm, setPersonaForm] = useState({
    name: "",
    key: "",
    description: "",
    systemPrompt: "",
    subjects: "",
    isActive: true
  });

  const { createPersona, updatePersona, deletePersona } = useAdminPersonas(user?.role, { skipList: true });
  const { data: personasResponse, isLoading: personasLoading } = useQuery({
    queryKey: ['/api/admin/bot-personas', 'paginated', personaPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(PERSONA_PAGE_SIZE),
        offset: String((personaPage - 1) * PERSONA_PAGE_SIZE),
      });
      const res = await apiRequest('GET', `/api/admin/bot-personas?${params.toString()}`);
      return res.json();
    },
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role),
  });
  const personasList = Array.isArray(personasResponse?.data) ? personasResponse.data : [];
  const totalPersonas = personasResponse?.total ?? 0;
  const totalPersonaPages = Math.max(1, Math.ceil(totalPersonas / PERSONA_PAGE_SIZE));

  const PRESET_PLACEHOLDER = "__preset_placeholder__";
  const [presetSelect, setPresetSelect] = useState("");
  const loadPreset = (presetKey: string) => {
    if (presetKey === PRESET_PLACEHOLDER) {
      setPresetSelect("");
      return;
    }
    const preset = KERU_PERSONA_PRESETS.find(p => p.key === presetKey);
    if (preset) {
      setPersonaForm({
        name: preset.name,
        key: preset.key,
        description: preset.description,
        systemPrompt: preset.systemPrompt,
        subjects: preset.subjects,
        isActive: true
      });
      setSelectedPersona(null);
      setPresetSelect(presetKey);
    }
  };

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
    setPresetSelect("");
  };

  const handlePersonaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPersona) {
      updatePersona.mutate({ id: selectedPersona.id, data: { ...personaForm, agentKey: personaForm.key } }, {
        onSuccess: () => resetPersonaForm()
      });
    } else {
      // Backend expects agentKey; form uses key
      createPersona.mutate({ ...personaForm, agentKey: personaForm.key }, {
        onSuccess: () => resetPersonaForm()
      });
    }
  };

  const editPersona = (persona: any) => {
    setSelectedPersona(persona);
    setPersonaForm({
      name: persona.name ?? '',
      key: persona.key ?? '',
      description: persona.description ?? '',
      systemPrompt: persona.systemPrompt ?? '',
      subjects: formatPersonaSubjects(persona.subjects),
      isActive: persona.isActive ?? true
    });
  };

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Buddy AI Management</h2>
        <p className="text-gray-600 mb-6">Configure AI tutors, personas, and learning interactions. Duplicate questions return cached answers to save tokens.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Persona Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Create/Edit AI Persona</h3>
              <Select onValueChange={loadPreset} value={presetSelect || PRESET_PLACEHOLDER}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Load Keru preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PRESET_PLACEHOLDER}>— Select preset —</SelectItem>
                  {KERU_PERSONA_PRESETS.map(p => (
                    <SelectItem key={p.key} value={p.key}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {personasList.map((persona: any) => (
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
                      {formatPersonaSubjects(persona.subjects) && (
                        <p className="text-xs text-gray-500">Subjects: {formatPersonaSubjects(persona.subjects)}</p>
                      )}
                    </div>
                  ))}
                </div>
                {totalPersonaPages > 1 && (
                  <div className="pt-2 border-t flex justify-center">
                    <Pagination>
                      <PaginationContent className="flex items-center gap-2">
                        <PaginationItem>
                          <Button variant="outline" size="sm" onClick={() => setPersonaPage(p => Math.max(1, p - 1))} disabled={personaPage <= 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <span className="px-3 py-2 text-sm text-gray-600">Page {personaPage} of {totalPersonaPages}</span>
                        </PaginationItem>
                        <PaginationItem>
                          <Button variant="outline" size="sm" onClick={() => setPersonaPage(p => Math.min(totalPersonaPages, p + 1))} disabled={personaPage >= totalPersonaPages}>
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection({ user }: { user: any }) {
  const isSuperuser = user?.role === 'superuser';

  const { data: detailedData, isLoading: detailedLoading } = useQuery({
    queryKey: ['/api/admin/analytics/detailed'],
    enabled: !!user?.role && isSuperuser
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role) && !isSuperuser
  });

  const { data: budgetAnalytics, isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/admin/budget-analytics'],
    enabled: !!user?.role && isSuperuser && !detailedData
  });

  const { data: chatAnalytics, isLoading: chatLoading } = useQuery({
    queryKey: ['/api/admin/chat-analytics'],
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role) && !isSuperuser
  });

  const d = detailedData as any;
  const loading = isSuperuser ? detailedLoading : analyticsLoading;

  if (isSuperuser && detailedLoading) {
    return (
      <div className="space-y-6">
        <div className="admin-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Super Admin Analytics</h2>
          <p className="text-gray-600 mb-6">Loading platform metrics…</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="admin-stat-card p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isSuperuser && detailedData) {
    const chartConfig = { count: { label: "Count", color: "hsl(var(--chart-1))" }, signups: { label: "Signups", color: "hsl(var(--chart-2))" } };
    const messagesByDay = (d.chat?.messagesByDayLast30 || []).slice(-14);
    const userGrowth = (d.userGrowth || []).slice(-14);
    const classChatByDay = (d.classChatMessagesByDay || []).slice(-14);

    return (
      <div className="space-y-6">
        <div className="admin-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Super Admin Analytics</h2>
          <p className="text-gray-600 mb-6">Platform-wide metrics, growth, and usage data.</p>

          {/* KPI Grid — 20+ metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalUsers ?? 0}</p>
              <p className="text-xs text-green-600">+{d.newUsersThisMonth ?? 0} this month</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Students</p>
              <p className="text-2xl font-bold text-blue-600">{d.usersByRole?.student ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teachers</p>
              <p className="text-2xl font-bold text-indigo-600">{d.usersByRole?.teacher ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{d.activeUsersLast30Days ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New This Week</p>
              <p className="text-2xl font-bold text-green-600">+{d.newUsersThisWeek ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Sessions</p>
              <p className="text-2xl font-bold text-emerald-600">{d.activeSessions ?? 0}</p>
              <p className="text-xs text-gray-500">Live now</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tutor Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalTutorSessions ?? 0}</p>
              <p className="text-xs text-gray-500">{d.sessionsThisMonth ?? 0} this month</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chat Messages</p>
              <p className="text-2xl font-bold text-purple-600">{d.chat?.totalRequests ?? 0}</p>
              <p className="text-xs text-gray-500">{d.chat?.thisMonth ?? 0} this month</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content Items</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalContent ?? 0}</p>
              <p className="text-xs text-gray-500">{d.publishedContent ?? 0} published</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Classes</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalClasses ?? 0}</p>
              <p className="text-xs text-gray-500">{d.activeClasses ?? 0} active</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class Members</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalClassMembers ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class Messages</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalClassChatMessages ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{d.assignmentsTotal ?? 0}</p>
              <p className="text-xs text-gray-500">{d.assignmentsCompleted ?? 0} completed</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Study Notes</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalStudyNotes ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blog Posts</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalBlogPosts ?? 0}</p>
              <p className="text-xs text-gray-500">{d.publishedBlogPosts ?? 0} published</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content Views</p>
              <p className="text-2xl font-bold text-gray-900">{d.totalContentViewCount ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Game Plays</p>
              <p className="text-2xl font-bold text-gray-900">{d.gameScoresCount ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">QA Cache Hits</p>
              <p className="text-2xl font-bold text-gray-900">{d.qaCacheEntries ?? 0}</p>
            </div>
            <div className="admin-stat-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">System</p>
              <p className="text-2xl font-bold text-emerald-600">{d.systemHealth ?? 'Healthy'}</p>
            </div>
          </div>

          {/* User growth & Tutor messages charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Signups (last 14 days)</h3>
              {userGrowth.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={userGrowth} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-signups)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">No signup data for this period.</p>
              )}
            </div>
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tutor messages (last 14 days)</h3>
              {messagesByDay.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={messagesByDay} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5) ?? v} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">No message data for this period.</p>
              )}
            </div>
          </div>

          {/* Content by type & subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2" /> Content by type</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {((d.contentByType as { type: string; count: number }[]) || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No content yet.</p>
                ) : (
                  (d.contentByType as { type: string; count: number }[]).map((row: { type: string; count: number }, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{row.type || 'N/A'}</span>
                      <span className="font-medium">{row.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Content by subject</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {((d.contentBySubject as { subject: string; count: number }[]) || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No content yet.</p>
                ) : (
                  (d.contentBySubject as { subject: string; count: number }[]).map((row: { subject: string; count: number }, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{row.subject || 'N/A'}</span>
                      <span className="font-medium">{row.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Messages by agent & by subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><Bot className="w-4 h-4 mr-2" /> Messages by agent</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {((d.chat?.messagesByAgent as { name: string; agentKey: string; count: number }[]) || []).map((row: { name: string; agentKey: string; count: number }, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{row.name || row.agentKey}</span>
                    <span className="font-medium">{row.count}</span>
                  </div>
                ))}
                {(!d.chat?.messagesByAgent || d.chat.messagesByAgent.length === 0) && <p className="text-sm text-gray-500">No data.</p>}
              </div>
            </div>
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Messages by subject</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {((d.chat?.messagesBySubject as { subject: string; count: number }[]) || []).map((row: { subject: string; count: number }, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{row.subject}</span>
                    <span className="font-medium">{row.count}</span>
                  </div>
                ))}
                {(!d.chat?.messagesBySubject || d.chat.messagesBySubject.length === 0) && <p className="text-sm text-gray-500">No data.</p>}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="border-t pt-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2" /> BudgetPal</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Budget users</p>
                <p className="text-xl font-bold text-blue-600">{d.budget?.registeredUsers ?? 0}</p>
              </div>
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Transactions</p>
                <p className="text-xl font-bold text-gray-900">{d.budget?.totalTransactions ?? 0}</p>
              </div>
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Avg budget</p>
                <p className="text-xl font-bold text-green-600">${d.budget?.averageBudget ?? 0}</p>
              </div>
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Avg expense</p>
                <p className="text-xl font-bold text-red-600">${d.budget?.avgMonthlyExpense ?? 0}</p>
              </div>
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Popular category</p>
                <p className="text-sm font-medium text-gray-900 truncate">{d.budget?.popularCategory ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Mentorship */}
          <div className="border-t pt-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><Handshake className="w-5 h-5 mr-2" /> Mentorship</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Mentor profiles</p>
                <p className="text-xl font-bold text-gray-900">{d.mentorProfilesCount ?? 0}</p>
              </div>
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Applications (pending)</p>
                <p className="text-xl font-bold text-amber-600">{d.mentorApplicationsPending ?? 0} / {d.mentorApplicationsTotal ?? 0}</p>
              </div>
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Requests total</p>
                <p className="text-xl font-bold text-gray-900">{d.mentorshipRequestsTotal ?? 0}</p>
              </div>
              <div className="admin-card p-4">
                <p className="text-xs text-gray-500">Sessions (completed)</p>
                <p className="text-xl font-bold text-green-600">{d.mentorshipSessionsCompleted ?? 0} / {d.mentorshipSessionsTotal ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Assignments by status & Blog by category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Assignments by status</h3>
              <div className="space-y-2">
                {(d.assignmentsByStatus as { status: string; count: number }[] || []).map((row: { status: string; count: number }, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{row.status}</span>
                    <span className="font-medium">{row.count}</span>
                  </div>
                ))}
                {(!d.assignmentsByStatus || d.assignmentsByStatus.length === 0) && <p className="text-sm text-gray-500">No assignments.</p>}
              </div>
            </div>
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><BookMarked className="w-4 h-4 mr-2" /> Blog by category</h3>
              <div className="space-y-2">
                {(d.blogPostsByCategory as { category: string; count: number }[] || []).map((row: { category: string; count: number }, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{row.category}</span>
                    <span className="font-medium">{row.count}</span>
                  </div>
                ))}
                {(!d.blogPostsByCategory || d.blogPostsByCategory.length === 0) && <p className="text-sm text-gray-500">No posts.</p>}
              </div>
            </div>
          </div>

          {/* Frequent questions */}
          <div className="admin-card p-4 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Frequent student questions (sample)</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(d.chat?.frequentQuestions as { text: string; count: number }[] || []).map((q: { text: string; count: number }, i: number) => (
                <div key={i} className="flex justify-between gap-4 text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-700 truncate flex-1">{q.text}</span>
                  <span className="font-medium shrink-0">{q.count}</span>
                </div>
              ))}
              {(!d.chat?.frequentQuestions || d.chat.frequentQuestions.length === 0) && <p className="text-sm text-gray-500">No data yet.</p>}
            </div>
          </div>

          {/* Recent signups & Top users by sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><User className="w-4 h-4 mr-2" /> Recent signups</h3>
              <ScrollArea className="h-[240px]">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2">User</th><th className="text-left py-2">Role</th><th className="text-left py-2">Date</th></tr></thead>
                  <tbody>
                    {(d.recentSignups as { id: number; username: string; role: string; createdAt: string; displayName: string }[] || []).map((u: { id: number; username: string; role: string; createdAt: string; displayName: string }) => (
                      <tr key={u.id} className="border-b border-gray-100">
                        <td className="py-1.5">{u.displayName || u.username}</td>
                        <td className="py-1.5"><Badge variant="secondary">{u.role}</Badge></td>
                        <td className="py-1.5 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
              {(!d.recentSignups || d.recentSignups.length === 0) && <p className="text-sm text-gray-500 py-4">No signups yet.</p>}
            </div>
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><Activity className="w-4 h-4 mr-2" /> Top users by tutor sessions</h3>
              <ScrollArea className="h-[240px]">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2">User</th><th className="text-right py-2">Sessions</th></tr></thead>
                  <tbody>
                    {(d.topUsersBySessions as { displayName: string; userId: number; sessionCount: number }[] || []).map((u: { displayName: string; userId: number; sessionCount: number }, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1.5">{u.displayName}</td>
                        <td className="py-1.5 text-right font-medium">{u.sessionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
              {(!d.topUsersBySessions || d.topUsersBySessions.length === 0) && <p className="text-sm text-gray-500 py-4">No sessions yet.</p>}
            </div>
          </div>

          {/* Class chat by day */}
          {classChatByDay.length > 0 && (
            <div className="admin-card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Class chat messages (last 14 days)</h3>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={classChatByDay} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5) ?? v} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
        <p className="text-gray-600 mb-6">View platform usage and learning progress.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsLoading ? '...' : (analyticsData as any)?.totalUsers || '0'}</p>
                <p className="text-xs text-green-600">+{(analyticsData as any)?.newUsersThisMonth || '0'} this month</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsLoading ? '...' : (analyticsData as any)?.activeSessions || '0'}</p>
                <p className="text-xs text-green-600">Live now</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{chatLoading ? '...' : (chatAnalytics as any)?.totalRequests || '0'}</p>
                <p className="text-xs text-blue-600">{(chatAnalytics as any)?.thisMonth || '0'} this month</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="admin-stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Items</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsLoading ? '...' : (analyticsData as any)?.totalContent || '0'}</p>
                <p className="text-xs text-gray-500">{(analyticsData as any)?.publishedContent ?? 0} published</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        {user.role === 'superuser' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2" /> BudgetPal Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="admin-card p-4">
                <h4 className="font-medium mb-2">Active Budget Users</h4>
                <p className="text-2xl font-bold text-blue-600">{budgetLoading ? '...' : (budgetAnalytics as any)?.registeredUsers || '0'}</p>
              </div>
              <div className="admin-card p-4">
                <h4 className="font-medium mb-2">Total Transactions</h4>
                <p className="text-2xl font-bold text-green-600">{budgetLoading ? '...' : (budgetAnalytics as any)?.totalTransactions || '0'}</p>
              </div>
              <div className="admin-card p-4">
                <h4 className="font-medium mb-2">Avg Monthly Budget</h4>
                <p className="text-2xl font-bold text-purple-600">${budgetLoading ? '...' : (budgetAnalytics as any)?.averageBudget || '0'}</p>
              </div>
            </div>
          </div>
        )}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><MessageSquare className="w-5 h-5 mr-2" /> Chat Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2">Total Requests</h4>
              <p className="text-2xl font-bold text-blue-600">{chatLoading ? '...' : (chatAnalytics as any)?.totalRequests || '0'}</p>
            </div>
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2">This Month</h4>
              <p className="text-2xl font-bold text-green-600">{chatLoading ? '...' : (chatAnalytics as any)?.thisMonth || '0'}</p>
            </div>
            <div className="admin-card p-4">
              <h4 className="font-medium mb-2">Average Daily</h4>
              <p className="text-2xl font-bold text-purple-600">{chatLoading ? '...' : Math.round(((chatAnalytics as any)?.thisMonth || 0) / 30) || '0'}</p>
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
    isPublished: false,
    showOnLanding: false
  });

  const [blogPage, setBlogPage] = useState(1);
  const BLOG_PAGE_SIZE = 10;

  // Blog Posts Query with pagination
  const { data: postsRaw, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/admin/blog-posts', blogPage],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(BLOG_PAGE_SIZE), offset: String((blogPage - 1) * BLOG_PAGE_SIZE) });
      const res = await apiRequest('GET', `/api/admin/blog-posts?${params.toString()}`);
      return res.json();
    },
    enabled: !!user?.role && ['superuser', 'teacher'].includes(user.role)
  });
  const posts = (postsRaw?.data ?? []) as any[];
  const totalPosts = postsRaw?.total ?? 0;
  const totalBlogPages = Math.max(1, Math.ceil(totalPosts / BLOG_PAGE_SIZE));

  // Blog Post Mutations
  const createBlogMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/blog-posts", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/landing'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/blog/landing'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/blog/landing'] });
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
      isPublished: false,
      showOnLanding: false
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
      isPublished: post.isPublished,
      showOnLanding: !!post.showOnLanding
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
              
              <div className="flex flex-col gap-3">
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="blog-show-landing"
                    checked={blogForm.showOnLanding}
                    onCheckedChange={(checked) => setBlogForm({...blogForm, showOnLanding: checked})}
                  />
                  <Label htmlFor="blog-show-landing">Show on landing page (featured)</Label>
                </div>
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
              <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {posts.map((post: any) => (
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
                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      {post.showOnLanding && (
                        <Badge variant="secondary" className="text-xs">Landing</Badge>
                      )}
                      {post.tags && (
                        <span>Tags: {post.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalBlogPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setBlogPage(p => Math.max(1, p - 1))} disabled={blogPage <= 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-600">Page {blogPage} of {totalBlogPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setBlogPage(p => Math.min(totalBlogPages, p + 1))} disabled={blogPage >= totalBlogPages}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURE_KEYS = [
  { key: 'revision_materials', label: 'Revision Materials', icon: BookOpen },
  { key: 'studybuddy_ai', label: 'StudyBuddy AI', icon: Bot },
  { key: 'budget_tracker', label: 'Budget Tracker', icon: DollarSign },
  { key: 'games', label: 'Games', icon: Gamepad2 },
  { key: 'content_management', label: 'Content Management', icon: FileText },
  { key: 'travel_blog', label: 'Travel Blog', icon: Globe },
  { key: 'dao_access', label: 'DAO Access', icon: Code },
  { key: 'admin_panel', label: 'Admin Panel', icon: Shield },
] as const;

interface ModerationSettings {
  blockedUsernamePatterns: string[];
  blockedEmailPatterns: string[];
  blockedWords: string[];
  signupRateLimitPerIpPerHour: number;
  chatMessagesPerUserPerMinute: number;
}

interface BadWordLeaderboardEntry {
  userId: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  count: number;
  lastWord: string;
  lastAt: string;
}

function SystemSettingsSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [features, setFeatures] = useState<Record<string, boolean>>(() =>
    FEATURE_KEYS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {})
  );

  const { data: featuresData } = useQuery<Record<string, boolean>>({
    queryKey: ['/api/admin/system/features'],
    staleTime: 30_000,
  });
  useEffect(() => {
    if (featuresData && typeof featuresData === 'object') {
      setFeatures(prev => ({ ...prev, ...featuresData }));
    }
  }, [featuresData]);

  const { data: moderationData } = useQuery<ModerationSettings>({
    queryKey: ['/api/admin/system/moderation'],
    staleTime: 30_000,
  });
  const [moderation, setModeration] = useState<ModerationSettings>({
    blockedUsernamePatterns: [],
    blockedEmailPatterns: [],
    blockedWords: [],
    signupRateLimitPerIpPerHour: 0,
    chatMessagesPerUserPerMinute: 0,
  });
  useEffect(() => {
    if (moderationData) {
      setModeration({
        blockedUsernamePatterns: moderationData.blockedUsernamePatterns ?? [],
        blockedEmailPatterns: moderationData.blockedEmailPatterns ?? [],
        blockedWords: moderationData.blockedWords ?? [],
        signupRateLimitPerIpPerHour: moderationData.signupRateLimitPerIpPerHour ?? 0,
        chatMessagesPerUserPerMinute: moderationData.chatMessagesPerUserPerMinute ?? 0,
      });
    }
  }, [moderationData]);

  const { data: badWordLeaderboard = [] } = useQuery<BadWordLeaderboardEntry[]>({
    queryKey: ['/api/admin/system/bad-words-leaderboard'],
    staleTime: 30_000,
  });

  const { data: apiKeysStatus } = useQuery<{ openai: string; perplexity: string }>({
    queryKey: ['/api/admin/system/api-keys'],
    staleTime: 30_000,
  });
  const [apiKeysDialogOpen, setApiKeysDialogOpen] = useState(false);
  const [apiKeyOpenai, setApiKeyOpenai] = useState('');
  const [apiKeyPerplexity, setApiKeyPerplexity] = useState('');
  const apiKeysMutation = useMutation({
    mutationFn: async (payload: { openai?: string; perplexity?: string }) => {
      const res = await apiRequest('PATCH', '/api/admin/system/api-keys', payload);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === 'string' ? data.error : (data?.error?.message ?? data?.message);
        throw new Error(typeof msg === 'string' ? msg : `Failed to save API keys (${res.status})`);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/api-keys'] });
      setApiKeysDialogOpen(false);
      setApiKeyOpenai('');
      setApiKeyPerplexity('');
      toast({ title: 'API keys updated', description: 'Keys saved. They will be used on the next AI request.' });
    },
    onError: (e: Error) => {
      toast({ title: 'Failed to update API keys', description: e.message, variant: 'destructive' });
    },
  });
  const saveApiKeys = () => {
    const payload: { openai?: string; perplexity?: string } = {};
    if (apiKeyOpenai.trim()) payload.openai = apiKeyOpenai.trim();
    if (apiKeyPerplexity.trim()) payload.perplexity = apiKeyPerplexity.trim();
    apiKeysMutation.mutate(payload);
  };

  const featureToggleMutation = useMutation({
    mutationFn: async ({ feature, enabled }: { feature: string; enabled: boolean }) => {
      const response = await apiRequest('PATCH', '/api/admin/system/features', { feature, enabled });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update feature');
      }
      return response.json();
    },
    onSuccess: (_, { feature, enabled }) => {
      setFeatures(prev => ({ ...prev, [feature]: enabled }));
      queryClient.invalidateQueries({ queryKey: ['/api/system/features'] });
      toast({ title: 'Feature updated', description: `${feature} ${enabled ? 'enabled' : 'disabled'}` });
    },
    onError: (error: Error, { feature, enabled }) => {
      setFeatures(prev => ({ ...prev, [feature]: !enabled }));
      toast({ title: 'Failed to update feature', description: error.message, variant: 'destructive' });
    }
  });

  const handleFeatureToggle = (key: string, current: boolean) => {
    const enabled = !current;
    setFeatures(prev => ({ ...prev, [key]: enabled }));
    featureToggleMutation.mutate({ feature: key, enabled });
  };

  const moderationMutation = useMutation({
    mutationFn: async (payload: ModerationSettings) => {
      const res = await apiRequest('PATCH', '/api/admin/system/moderation', payload);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err?.error?.message ?? err?.error ?? err?.message) || 'Failed to update moderation';
        throw new Error(typeof msg === 'string' ? msg : 'Failed to update moderation');
      }
      return res.json();
    },
    onSuccess: (data: ModerationSettings) => {
      setModeration(data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/moderation'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/bad-words-leaderboard'] });
      toast({ title: 'Moderation updated', description: 'Settings saved.' });
    },
    onError: (e: Error) => {
      toast({ title: 'Failed to update moderation', description: e.message, variant: 'destructive' });
    },
  });
  const saveModeration = () => {
    moderationMutation.mutate(moderation);
  };

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
                {FEATURE_KEYS.slice(0, 4).map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={features[key] ? "default" : "secondary"}>
                        {features[key] ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={!!features[key]}
                        onCheckedChange={() => handleFeatureToggle(key, !!features[key])}
                        disabled={featureToggleMutation.isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Teacher/Admin Features</h4>
              <div className="space-y-3">
                {FEATURE_KEYS.slice(4, 8).map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={features[key] ? "default" : "secondary"}>
                        {features[key] ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={!!features[key]}
                        onCheckedChange={() => handleFeatureToggle(key, !!features[key])}
                        disabled={featureToggleMutation.isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Moderation — block spam / account misuse patterns + bad words in chat */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2" />
            Moderation &amp; Safety
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Block usernames or email patterns (e.g. <code className="bg-gray-100 px-1 rounded">*@tempmail.com</code>, <code className="bg-gray-100 px-1 rounded">spam*</code>). Use * for any characters, ? for one character. Rate limits: 0 = disabled. Blocked words are checked in class chat (case-insensitive).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Blocked username patterns (one per line)</Label>
              <Textarea
                value={moderation.blockedUsernamePatterns.join('\n')}
                onChange={(e) => setModeration(prev => ({ ...prev, blockedUsernamePatterns: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                placeholder="e.g. admin&#10;bot*&#10;*spam"
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Blocked email patterns (one per line)</Label>
              <Textarea
                value={moderation.blockedEmailPatterns.join('\n')}
                onChange={(e) => setModeration(prev => ({ ...prev, blockedEmailPatterns: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                placeholder="e.g. *@tempmail.com&#10;*@throwaway.*"
                rows={3}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Blocked words in class chat (one per line, case-insensitive)</Label>
            <Textarea
              value={moderation.blockedWords.join('\n')}
              onChange={(e) => setModeration(prev => ({ ...prev, blockedWords: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
              placeholder="e.g. badword&#10;another"
              rows={3}
              className="font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Signup rate limit (per IP per hour, 0 = off)</Label>
              <Input
                type="number"
                min={0}
                value={moderation.signupRateLimitPerIpPerHour}
                onChange={(e) => setModeration(prev => ({ ...prev, signupRateLimitPerIpPerHour: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Chat messages per user per minute (0 = off)</Label>
              <Input
                type="number"
                min={0}
                value={moderation.chatMessagesPerUserPerMinute}
                onChange={(e) => setModeration(prev => ({ ...prev, chatMessagesPerUserPerMinute: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
              />
            </div>
          </div>
          <Button onClick={saveModeration} disabled={moderationMutation.isPending} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save moderation settings
          </Button>

          {/* Bad words leaderboard — users who attempted blocked words most */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Bad words leaderboard</h4>
            <p className="text-sm text-gray-500 mb-3">Users who attempted to send blocked words in class chat (most attempts first).</p>
            {badWordLeaderboard.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No attempts recorded yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">User</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">Attempts</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Last word</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Last at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {badWordLeaderboard.map((row) => (
                      <tr key={row.userId} className="bg-white">
                        <td className="px-4 py-2">
                          {[row.firstName, row.lastName].filter(Boolean).join(' ') || row.username || `#${row.userId}`}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">{row.count}</td>
                        <td className="px-4 py-2 font-mono text-red-600">{row.lastWord}</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(row.lastAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            <div className="flex items-center justify-between p-4 border rounded-lg flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">OpenAI API</p>
                  <p className="text-sm text-gray-500">Study Buddy AI (primary). Used for tutoring responses.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={apiKeysStatus?.openai === 'not_set' ? 'secondary' : 'default'}>
                  {apiKeysStatus?.openai === 'set' ? 'Configured (stored)' : apiKeysStatus?.openai === 'env' ? 'From env' : 'Not set'}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => { setApiKeyOpenai(''); setApiKeyPerplexity(''); setApiKeysDialogOpen(true); }}>Change key</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Perplexity API</p>
                  <p className="text-sm text-gray-500">Study Buddy AI fallback when OpenAI is unavailable; provides factual, up-to-date answers.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={apiKeysStatus?.perplexity === 'not_set' ? 'secondary' : 'default'}>
                  {apiKeysStatus?.perplexity === 'set' ? 'Configured (stored)' : apiKeysStatus?.perplexity === 'env' ? 'From env' : 'Not set'}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => { setApiKeyOpenai(''); setApiKeyPerplexity(''); setApiKeysDialogOpen(true); }}>Change key</Button>
              </div>
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

          <Dialog open={apiKeysDialogOpen} onOpenChange={setApiKeysDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>API keys</DialogTitle>
                <DialogDescription>
                  Store keys here to override environment variables. Leave a field blank to keep current (stored or env). Clear the field and save to use only env for that key.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key-openai">OpenAI API key</Label>
                  <Input
                    id="api-key-openai"
                    type="password"
                    autoComplete="off"
                    placeholder="Leave blank to keep current"
                    value={apiKeyOpenai}
                    onChange={(e) => setApiKeyOpenai(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-perplexity">Perplexity API key</Label>
                  <Input
                    id="api-key-perplexity"
                    type="password"
                    autoComplete="off"
                    placeholder="Leave blank to keep current"
                    value={apiKeyPerplexity}
                    onChange={(e) => setApiKeyPerplexity(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setApiKeysDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveApiKeys} disabled={apiKeysMutation.isPending}>
                  {apiKeysMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
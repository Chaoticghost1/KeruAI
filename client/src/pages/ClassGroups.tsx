import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Plus,
  Copy,
  MessageSquare,
  GraduationCap,
  Hash,
  Send,
  ArrowLeft,
  Loader2,
  UserCheck,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Archive,
  ShieldOff,
  Clock,
  VolumeX,
  Volume2,
  UserX,
  Ban,
  Unlock,
  UserPlus,
  UserMinus,
  Trash2,
  ChevronUp
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageLayout } from "@/components/PageLayout";

type Class = { id: number; name: string; inviteCode: string; subject: string | null; teacherId: number; status?: string; blockedUntil?: string | null; createdAt: string };
type ClassMemberExt = { id: number; classId: number; userId: number; role: string; status: string; canChat?: boolean; isBanned?: boolean; accessRevoked?: boolean; user: { firstName?: string; lastName?: string; username: string } };
type EnrolledClass = { class: Class; member: { id: number; classId: number; userId: number; role: string; status?: string; canChat?: boolean; isBanned?: boolean; accessRevoked?: boolean } };
type ChatMessage = { id: number; message: string; senderId: number; createdAt: string; sender?: { firstName?: string; lastName?: string; username: string; role?: string } };
type TeacherOption = { id: number; firstName?: string | null; lastName?: string | null; email?: string | null; username: string };
type SelectedTeacher = { id: number; firstName?: string | null; lastName?: string | null; email?: string | null; username: string; selectedAt: string };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

function formatMessageDate(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);
  if (dDay.getTime() === today.getTime()) return "Today";
  if (dDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function groupMessagesByDate(messages: ChatMessage[]): { dateLabel: string; messages: ChatMessage[] }[] {
  // API returns oldest-first; keep that order so newest messages appear just above the send button
  const chronological = [...messages];
  const groups: { dateLabel: string; messages: ChatMessage[] }[] = [];
  let currentDate = "";
  for (const m of chronological) {
    const dateLabel = formatMessageDate(new Date(m.createdAt));
    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      groups.push({ dateLabel, messages: [m] });
    } else {
      groups[groups.length - 1].messages.push(m);
    }
  }
  return groups;
}

export default function ClassGroups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const isEs = language === "es";
  const [inviteCode, setInviteCode] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockMinutes, setBlockMinutes] = useState(30);
  const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  const lastAutoOpenedClassId = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const CHAT_PAGE_SIZE = 50;
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadOlderLoading, setLoadOlderLoading] = useState(false);

  useEffect(() => {
    setOlderMessages([]);
    setHasMoreOlder(false);
  }, [selectedClassId]);

  const isTeacher = user?.role === "teacher" || user?.role === "superuser";

  // Teacher: fetch their classes (always fresh - no cache)
  const { data: teacherClasses = [], isLoading: teacherLoading, error: teacherError, refetch: refetchTeacherClasses } = useQuery({
    queryKey: ["/api/classes/teacher", user?.id],
    enabled: !!user && isTeacher,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      console.log('[ClassGroups] Fetching teacher classes for user:', user?.id);
      const res = await apiRequest("GET", "/api/classes/teacher");
      const data = await res.json();
      console.log('[ClassGroups] Teacher classes response:', data);
      return Array.isArray(data) ? data : [];
    },
  });

  // Student: fetch enrolled classes
  const { data: studentClasses = [], isLoading: studentLoading } = useQuery({
    queryKey: ["/api/classes/student", user?.id],
    enabled: !!user && !isTeacher,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      console.log('[ClassGroups] Fetching student classes for user:', user?.id);
      const res = await apiRequest("GET", "/api/classes/student");
      const data = await res.json();
      console.log('[ClassGroups] Student classes response:', data);
      return data;
    },
  });

  // Student: list of teachers available to select (isActive + isVerified)
  const { data: availableTeachers = [] } = useQuery<TeacherOption[]>({
    queryKey: ["/api/teachers"],
    enabled: !!user && !isTeacher,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/teachers");
      return res.json();
    },
  });

  // Student: my selected teachers
  const { data: selectedTeachers = [], refetch: refetchSelectedTeachers } = useQuery<SelectedTeacher[]>({
    queryKey: ["/api/students/teachers"],
    enabled: !!user && !isTeacher,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/students/teachers");
      return res.json();
    },
  });

  const addTeacherMutation = useMutation({
    mutationFn: async (teacherId: number) => {
      const res = await apiRequest("POST", `/api/students/teachers/${teacherId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add teacher");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["revision-materials"] });
      toast({ title: isEs ? "Profesor agregado" : "Teacher added", description: isEs ? "Ahora puedes ver sus materiales de revisión." : "You can now see their revision materials." });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const removeTeacherMutation = useMutation({
    mutationFn: async (teacherId: number) => {
      const res = await apiRequest("DELETE", `/api/students/teachers/${teacherId}`);
      if (!res.ok) throw new Error("Failed to remove teacher");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["revision-materials"] });
      toast({ title: isEs ? "Profesor quitado" : "Teacher removed" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  // Selected class details (includes members with status for sidebar badges)
  const { data: classDetails, refetch: refetchClassDetails } = useQuery({
    queryKey: ["/api/classes", selectedClassId],
    enabled: !!selectedClassId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/classes/${selectedClassId}`);
      return res.json();
    },
  });

  // Chat messages (returns { messages, teacherId, hasMore }); initial page only (offset 0)
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/classes", selectedClassId, "messages", 0, CHAT_PAGE_SIZE],
    enabled: !!selectedClassId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/classes/${selectedClassId}/messages?limit=${CHAT_PAGE_SIZE}&offset=0`);
      return res.json();
    },
  });
  const latestPageMessages: ChatMessage[] = (messagesData?.messages ?? []) as ChatMessage[];
  const chatTeacherId = typeof messagesData === "object" && messagesData?.teacherId != null ? messagesData.teacherId : undefined;

  useEffect(() => {
    if (olderMessages.length === 0 && messagesData && typeof messagesData === "object" && "hasMore" in messagesData) {
      setHasMoreOlder(!!(messagesData as { hasMore?: boolean }).hasMore);
    }
  }, [messagesData, olderMessages.length]);

  const messages: ChatMessage[] = [...olderMessages, ...latestPageMessages];

  async function loadOlderMessages() {
    if (!selectedClassId || loadOlderLoading) return;
    setLoadOlderLoading(true);
    try {
      const offset = olderMessages.length + latestPageMessages.length;
      const res = await apiRequest("GET", `/api/classes/${selectedClassId}/messages?limit=${CHAT_PAGE_SIZE}&offset=${offset}`);
      const data = await res.json();
      const list = Array.isArray(data?.messages) ? data.messages : [];
      setOlderMessages((prev) => [...list, ...prev]);
      setHasMoreOlder(!!data?.hasMore);
    } finally {
      setLoadOlderLoading(false);
    }
  }

  const joinMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/classes/join", { inviteCode: code });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to join class");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes/student"] });
      toast({ title: "Success", description: "You joined the class!" });
      setInviteCode("");
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; subject?: string }) => {
      const res = await apiRequest("POST", "/api/classes", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create class");
      }
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/classes/teacher"] });
      toast({ title: "Success", description: "Class created! Share the invite code with your students." });
      setNewClassName("");
      setNewClassSubject("");
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: string) => {
      const res = await apiRequest("POST", `/api/classes/${selectedClassId}/messages`, { message: msg });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err?.error ?? err?.message ?? "Failed to send message";
        throw new Error(typeof message === "string" ? message : "Failed to send message");
      }
      return res.json();
    },
    onSuccess: () => {
      setChatMessage("");
      refetchMessages();
    },
    onError: (e: Error) => {
      toast({ title: isEs ? "No se pudo enviar" : "Could not send", description: e.message, variant: "destructive" });
    },
  });

  const approveMemberMutation = useMutation({
    mutationFn: async ({ classId, userId }: { classId: number; userId: number }) => {
      const res = await apiRequest("PATCH", `/api/classes/${classId}/members/${userId}/approve`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClassId] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes/teacher"] });
      refetchClassDetails();
      toast({ title: "Success", description: "Student approved. They can now access the chat and materials." });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const invalidateClass = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClassId] });
    queryClient.invalidateQueries({ queryKey: ["/api/classes/teacher"] });
    refetchClassDetails();
    refetchMessages();
  };

  const moderationMutation = useMutation({
    mutationFn: async ({ action, classId, userId, minutes }: { action: string; classId: number; userId?: number; minutes?: number }) => {
      let url = `/api/classes/${classId}/${action}`;
      if (userId) url = `/api/classes/${classId}/members/${userId}/${action}`;
      const res = await apiRequest("PATCH", url, minutes !== undefined ? { minutes } : undefined);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${action}`);
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      invalidateClass();
      const msgs: Record<string, string> = {
        terminate: "Chat terminated",
        archive: "Chat archived",
        block: "Chat blocked",
        unblock: "Chat unblocked",
        mute: "Student muted",
        unmute: "Student unmuted",
        ban: "Student banned",
        unban: "Student unbanned",
        "revoke-access": "Access revoked",
        "restore-access": "Access restored",
      };
      toast({ title: "Success", description: msgs[vars.action] || "Done" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Invite code copied to clipboard" });
  };

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: number) => {
      const res = await apiRequest("DELETE", `/api/classes/${classId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to delete class");
      }
    },
    onSuccess: (_, classId) => {
      setDeleteClassDialogOpen(false);
      setClassToDelete(null);
      if (selectedClassId === classId) setSelectedClassId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/classes/teacher"] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId] });
      queryClient.refetchQueries({ queryKey: ["/api/classes/teacher"] });
      toast({
        title: isEs ? "Clase eliminada" : "Class deleted",
        description: isEs ? "La clase se eliminó correctamente." : "The class was deleted successfully.",
      });
    },
    onError: (e: Error) => {
      toast({ title: isEs ? "Error" : "Error", description: e.message, variant: "destructive" });
    },
  });

  // Auto-open approval modal when teacher opens a class that has pending students
  const classDetailsWithMembers = classDetails as (Class & { members?: { status: string }[] }) | undefined;
  const pendingCount = classDetailsWithMembers?.members?.filter((m) => m.status === "pending").length ?? 0;
  useEffect(() => {
    if (!selectedClassId || !isTeacher || pendingCount === 0) return;
    if (lastAutoOpenedClassId.current === selectedClassId) return;
    lastAutoOpenedClassId.current = selectedClassId;
    setApproveModalOpen(true);
  }, [selectedClassId, isTeacher, pendingCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayedClasses = isTeacher ? teacherClasses : studentClasses;

  if (!user) return null;

  // Chat view
  if (selectedClassId && classDetails) {
    const cls = classDetails as Class & { members?: ClassMemberExt[] };
    const currentEnrollment = !isTeacher ? (studentClasses as EnrolledClass[]).find((e: EnrolledClass) => e.class.id === selectedClassId) : null;
    const isPending = !isTeacher && currentEnrollment && (currentEnrollment.member as { status?: string }).status === "pending";
    const status = cls.status ?? "active";
    const blockedUntil = cls.blockedUntil ? new Date(cls.blockedUntil) : null;
    const isChatOpen = status === "active" || (status === "blocked" && blockedUntil && blockedUntil <= new Date());

    // Student pending approval - same UI as chat list
    if (isPending) {
      return (
        <PageLayout maxWidth="7xl">
        <div className="chat-app-container">
          <div className="chat-page-header">
            <button type="button" className="chat-back-btn" onClick={() => setSelectedClassId(null)}>
              <ArrowLeft className="w-[18px] h-[18px]" />
              {isEs ? "Volver a clases" : "Back to Classes"}
            </button>
          </div>
          <div className="chat-list-card">
            <div className="chat-list-card-header">
              <h2 className="chat-list-card-title">{cls.name}</h2>
              <p className="chat-list-card-description">
                {isEs ? "Esperando aprobación del profesor" : "Waiting for teacher approval"}
              </p>
            </div>
            <div className="chat-list-card-content">
              <p className="text-[var(--chat-text-secondary)]">
                {isEs
                  ? "Te has unido a esta clase. Tu profesor debe aprobarte para acceder al chat, materiales y grupos. Espera la aprobación."
                  : "You have joined this class. Your teacher must approve you before you can access the chat, study materials, and class groups. Please wait for approval."}
              </p>
            </div>
          </div>
        </div>
        </PageLayout>
      );
    }

    const teacherId = chatTeacherId ?? cls.teacherId;
    const messageGroups = groupMessagesByDate(messages as ChatMessage[]);

    return (
      <PageLayout maxWidth="7xl">
      <div className="chat-app-container">
        <div className="chat-page-header">
          <button
            type="button"
            className="chat-back-btn"
            onClick={() => setSelectedClassId(null)}
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            {isEs ? "Volver a clases" : "Back to Classes"}
          </button>
        </div>

        <div className="chat-container">
          {/* Sidebar: class info + members */}
          <aside className="chat-sidebar">
            <div className="chat-sidebar-header">
              <div>
                <h3 className="chat-class-name">{cls.name}</h3>
                <div className="chat-class-meta">
                  <span className="flex items-center gap-1">
                    <Users className="w-[14px] h-[14px]" />
                    {cls.members?.length ?? 0} {isEs ? "miembro(s)" : "member(s)"}
                  </span>
                  {cls.subject && <span>• {cls.subject}</span>}
                </div>
              </div>
            </div>
            <div className="chat-members-section">
              <div className="chat-section-title">
                {isEs ? "Miembros de la clase" : "Class Members"}
              </div>
              <div className="chat-member-list">
                {cls.members?.map((m: ClassMemberExt) => {
                  const displayName = `${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`.trim() || m.user?.username || `User ${m.userId}`;
                  const isTeacherMember = (m.role && String(m.role).toLowerCase()) === "teacher";
                  const memberStatus = (m.status && String(m.status).toLowerCase()) === "approved" ? "approved" : "pending";
                  return (
                    <div key={m.id} className="chat-member-item">
                      <div className="chat-member-info">
                        <div className="chat-member-avatar">{getInitials(displayName)}</div>
                        <div className="chat-member-details">
                          <div className="chat-member-name">{displayName}</div>
                          <div className="chat-member-status">
                            {memberStatus === "approved" ? (isEs ? "Aprobado" : "Approved") : (isEs ? "Pendiente" : "Pending")}
                            {m.isBanned && ` • ${isEs ? "Baneado" : "Banned"}`}
                            {memberStatus === "approved" && !m.canChat && !m.isBanned && ` • ${isEs ? "Silenciado" : "Muted"}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`chat-badge ${memberStatus === "approved" ? "chat-badge-approved" : "chat-badge-pending"} ${isTeacherMember ? "chat-badge-teacher" : ""}`}>
                          {isTeacherMember ? (isEs ? "Profesor" : "Teacher") : memberStatus === "approved" ? (isEs ? "Aprobado" : "Approved") : (isEs ? "Pendiente" : "Pending")}
                        </span>
                        {isTeacher && memberStatus === "pending" && (
                            <Button
                              size="sm"
                              className="!py-1 !px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => approveMemberMutation.mutate({ classId: selectedClassId!, userId: m.userId })}
                              disabled={approveMemberMutation.isPending}
                            >
                              {approveMemberMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                            </Button>
                          )}
                        {isTeacher && memberStatus === "approved" && !isTeacherMember && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="chat-icon-btn !w-8 !h-8">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {m.canChat ? (
                                <DropdownMenuItem onClick={() => moderationMutation.mutate({ action: "mute", classId: selectedClassId!, userId: m.userId })}>
                                  <VolumeX className="w-4 h-4 mr-2" /> {isEs ? "Silenciar" : "Mute"}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => moderationMutation.mutate({ action: "unmute", classId: selectedClassId!, userId: m.userId })}>
                                  <Volume2 className="w-4 h-4 mr-2" /> {isEs ? "Activar" : "Unmute"}
                                </DropdownMenuItem>
                              )}
                              {!m.isBanned ? (
                                <DropdownMenuItem className="text-destructive" onClick={() => moderationMutation.mutate({ action: "ban", classId: selectedClassId!, userId: m.userId })}>
                                  <Ban className="w-4 h-4 mr-2" /> {isEs ? "Banear" : "Ban"}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => moderationMutation.mutate({ action: "unban", classId: selectedClassId!, userId: m.userId })}>
                                  <UserCheck className="w-4 h-4 mr-2" /> {isEs ? "Desbanear" : "Unban"}
                                </DropdownMenuItem>
                              )}
                              {!m.accessRevoked ? (
                                <DropdownMenuItem className="text-destructive" onClick={() => moderationMutation.mutate({ action: "revoke-access", classId: selectedClassId!, userId: m.userId })}>
                                  <UserX className="w-4 h-4 mr-2" /> {isEs ? "Revocar acceso" : "Revoke access"}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => moderationMutation.mutate({ action: "restore-access", classId: selectedClassId!, userId: m.userId })}>
                                  <Unlock className="w-4 h-4 mr-2" /> {isEs ? "Restaurar acceso" : "Restore access"}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main chat area */}
          <main className="chat-main">
            <div className="chat-main-header">
              <div className="chat-title-section">
                <div className="chat-header-icon">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="chat-title-text">
                  <h2>{cls.name} – {isEs ? "Chat de clase" : "Class Chat"}</h2>
                  <p>{isEs ? "Chatea con tus compañeros" : "Chat with your classmates"}</p>
                </div>
              </div>
              <div className="chat-header-actions">
                {status !== "active" && (
                  <Badge variant={status === "terminated" ? "destructive" : status === "archived" ? "secondary" : "outline"}>
                    {status === "terminated" ? (isEs ? "Terminado" : "Terminated") : status === "archived" ? (isEs ? "Archivado" : "Archived") : blockedUntil && blockedUntil > new Date() ? `${isEs ? "Bloqueado hasta" : "Blocked until"} ${blockedUntil.toLocaleString()}` : "Active"}
                  </Badge>
                )}
                {isTeacher && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="chat-icon-btn" title={isEs ? "Opciones" : "More options"}>
                        <MoreVertical className="w-[18px] h-[18px]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{isEs ? "Moderar chat" : "Moderate chat"}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {status === "active" && (
                        <>
                          <DropdownMenuItem onClick={() => moderationMutation.mutate({ action: "terminate", classId: selectedClassId! })}>
                            <ShieldOff className="w-4 h-4 mr-2" /> {isEs ? "Terminar chat" : "Terminate chat"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => moderationMutation.mutate({ action: "archive", classId: selectedClassId! })}>
                            <Archive className="w-4 h-4 mr-2" /> {isEs ? "Archivar chat" : "Archive chat"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setBlockMinutes(30); setBlockModalOpen(true); }}>
                            <Clock className="w-4 h-4 mr-2" /> {isEs ? "Bloquear chat (duración)" : "Block chat (set duration)"}
                          </DropdownMenuItem>
                        </>
                      )}
                      {(status === "terminated" || status === "archived" || status === "blocked") && (
                        <DropdownMenuItem onClick={() => moderationMutation.mutate({ action: "unblock", classId: selectedClassId! })}>
                          <Unlock className="w-4 h-4 mr-2" /> {isEs ? "Reabrir chat" : "Reopen chat"}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {!isChatOpen && (
              <div className="px-6 pt-2">
                <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    {status === "terminated" ? (isEs ? "Este chat ha sido terminado. Nadie puede enviar mensajes." : "This chat has been terminated. No one can send messages.") : ""}
                    {status === "archived" ? (isEs ? "Este chat está archivado. Puedes ver mensajes pero no enviar nuevos." : "This chat has been archived. You can view messages but cannot send new ones.") : ""}
                    {status === "blocked" && blockedUntil && blockedUntil > new Date() ? (isEs ? "Este chat está bloqueado hasta " : "This chat is temporarily blocked until ") + blockedUntil.toLocaleString() + "." : ""}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {isTeacher && pendingCount > 0 && (
              <div className="px-6 pt-2">
                <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <strong>{pendingCount}</strong> {isEs ? "estudiante(s) esperando aprobación." : `student${pendingCount !== 1 ? "s" : ""} waiting to chat.`} {isEs ? "Aprueba para dar acceso al grupo." : "Approve them so they can access the group."}
                    </span>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0" onClick={() => setApproveModalOpen(true)}>
                      <UserCheck className="w-4 h-4 mr-1" /> {isEs ? "Revisar pendientes" : "Review pending"}
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="chat-messages-area">
              {hasMoreOlder && (
                <div className="flex justify-center py-2 border-b border-[var(--chat-border)]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[var(--chat-text-secondary)]"
                    onClick={loadOlderMessages}
                    disabled={loadOlderLoading}
                  >
                    {loadOlderLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    )}
                    {isEs ? "Cargar mensajes anteriores" : "Load older messages"}
                  </Button>
                </div>
              )}
              {messageGroups.length === 0 && !sendMessageMutation.isPending && (
                <div className="flex-1 flex items-center justify-center text-[var(--chat-text-tertiary)] text-sm py-8">
                  {isEs ? "Aún no hay mensajes. ¡Envía el primero!" : "No messages yet. Send the first one!"}
                </div>
              )}
              {messageGroups.map(({ dateLabel, messages: dayMessages }) => (
                <div key={dateLabel}>
                  <div className="chat-date-divider">
                    <span>{dateLabel}</span>
                  </div>
                  {dayMessages.map((m) => {
                    const isTeacherMsg = teacherId != null && m.senderId === teacherId;
                    const isYou = m.senderId === user.id;
                    const senderLabel = isYou
                      ? (isEs ? "Tú" : "You")
                      : isTeacherMsg
                      ? (isEs ? "Profesor" : "Teacher")
                      : m.sender
                      ? (() => {
                          const name = `${m.sender.firstName || ""} ${m.sender.lastName || ""}`.trim();
                          const handle = m.sender.username ? `@${m.sender.username}` : "";
                          return name && handle ? `${name} (${handle})` : name || handle || "Unknown";
                        })()
                      : "Unknown";
                    const avatarInitials = isYou
                      ? getInitials(`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || (user?.username ?? "You"))
                      : isTeacherMsg
                      ? (isEs ? "Pr" : "Te")
                      : m.sender
                      ? getInitials(`${m.sender.firstName || ""} ${m.sender.lastName || ""}`.trim() || m.sender.username)
                      : "?";
                    const groupClass = isYou ? "chat-message-group own" : isTeacherMsg ? "chat-message-group teacher" : "chat-message-group student";
                    return (
                      <div key={m.id} className={groupClass}>
                        <div className="chat-message-avatar">{avatarInitials}</div>
                        <div className="chat-message-content">
                          <div className="chat-message-sender">{senderLabel}</div>
                          <div className="chat-message-bubble">{m.message}</div>
                          <div className="chat-message-time">{new Date(m.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="chat-typing-indicator">
                  <div className="chat-message-avatar">…</div>
                  <div className="chat-typing-bubble">
                    <div className="chat-typing-dot" />
                    <div className="chat-typing-dot" />
                    <div className="chat-typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <form
                className="chat-input-wrapper"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chatMessage.trim() && isChatOpen) sendMessageMutation.mutate(chatMessage.trim());
                }}
              >
                <div className="chat-input-container">
                  <textarea
                    ref={messageInputRef}
                    className="chat-message-input"
                    placeholder={isChatOpen ? (isEs ? "Escribe un mensaje..." : "Type a message...") : (isEs ? "Chat cerrado" : "Chat is closed")}
                    value={chatMessage}
                    onChange={(e) => {
                      setChatMessage(e.target.value);
                      const el = messageInputRef.current;
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = Math.min(el.scrollHeight, 120) + "px";
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (chatMessage.trim() && isChatOpen) sendMessageMutation.mutate(chatMessage.trim());
                      }
                    }}
                    disabled={sendMessageMutation.isPending || !isChatOpen}
                    rows={1}
                  />
                </div>
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={sendMessageMutation.isPending || !chatMessage.trim() || !isChatOpen}
                >
                  {sendMessageMutation.isPending ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <><span>{isEs ? "Enviar" : "Send"}</span><Send className="w-[18px] h-[18px]" /></>}
                </button>
              </form>
            </div>
          </main>
        </div>

        {/* Approve students modal */}
        <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                {isEs ? "Aprobar estudiantes" : "Approve students"}
              </DialogTitle>
              <DialogDescription>
                {isEs ? "Los estudiantes siguientes solicitaron unirse. Aprueba para dar acceso al chat y materiales." : "Students below have requested to join this class. Approve them so they can access the chat and materials."}
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const pending = cls.members?.filter((m: { status: string }) => m.status === "pending") ?? [];
              if (pending.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {isEs ? "No hay estudiantes pendientes." : "No pending students. You can close this window."}
                  </p>
                );
              }
              return (
                <ScrollArea className="max-h-[280px] pr-2">
                  <div className="space-y-2">
                    {pending.map((m: { id: number; userId: number; user: { firstName?: string; lastName?: string; username: string } }) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border p-3 bg-slate-50/50">
                        <span className="text-sm font-medium">
                          {`${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() || m.user.username || `User ${m.userId}`}
                        </span>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => approveMemberMutation.mutate({ classId: selectedClassId!, userId: m.userId })}
                          disabled={approveMemberMutation.isPending}
                        >
                          {approveMemberMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4 mr-1" /> {isEs ? "Aprobar" : "Approve"}</>}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              );
            })()}
          </DialogContent>
        </Dialog>

        <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{isEs ? "Bloquear chat" : "Block chat"}</DialogTitle>
              <DialogDescription>
                {isEs ? "Bloquea el chat de la clase por un tiempo. Los estudiantes no podrán enviar mensajes hasta que expire." : "Block the class chat for a period. Students will not be able to send messages until the block expires."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>{isEs ? "Duración (minutos)" : "Duration (minutes)"}</Label>
                <Input
                  type="number"
                  min={1}
                  max={10080}
                  value={blockMinutes}
                  onChange={(e) => setBlockMinutes(Math.min(10080, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Max 10080 (7 {isEs ? "días" : "days"})</p>
              </div>
              <div className="flex gap-2">
                {[15, 30, 60, 1440].map((min) => (
                  <Button key={min} variant="outline" size="sm" onClick={() => setBlockMinutes(min)}>
                    {min < 60 ? `${min}m` : min === 60 ? "1h" : `${min / 1440}d`}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setBlockModalOpen(false)}>{isEs ? "Cancelar" : "Cancel"}</Button>
              <Button
                onClick={() => {
                  moderationMutation.mutate({ action: "block", classId: selectedClassId!, minutes: blockMinutes });
                  setBlockModalOpen(false);
                }}
                disabled={moderationMutation.isPending}
              >
                {moderationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isEs ? "Bloquear" : "Block"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </PageLayout>
    );
  }

  // Main view — same UI as chat: chat-app-container + chat-list-* cards
  return (
    <PageLayout maxWidth="7xl">
    <div className="chat-app-container">
      <div className="chat-list-page-header">
        <div>
          <h1 className="chat-list-title">
            <Users className="w-7 h-7 text-[var(--chat-primary)]" />
            {isEs ? "Grupos de clase" : "Class Groups"}
          </h1>
          <p className="chat-list-subtitle">
            {isTeacher
              ? (isEs ? "Crea clases y comparte códigos para que los estudiantes se unan y chateen." : "Create classes and share invite codes so students can join and chat with classmates.")
              : (isEs ? "Únete con el código de tu profesor y chatea con tus compañeros." : "Join a class with an invite code from your teacher, then chat with your classmates.")}
          </p>
        </div>
      </div>

      <div className="chat-list-card">
        <div className="chat-list-card-header">
          <div>
            <h2 className="chat-list-card-title">
              <MessageSquare className="w-5 h-5 text-[var(--chat-primary)]" />
              {isTeacher ? (isEs ? "Tus grupos de chat" : "Your chat groups") : (isEs ? "Mis grupos de chat" : "My chat groups")}
            </h2>
            <p className="chat-list-card-description">
              {isTeacher ? (isEs ? "Haz clic en un grupo para ver miembros y abrir el chat" : "Click a group to view members and open the class chat") : (isEs ? "Haz clic en un grupo para abrir el chat" : "Click a group to open the class chat")}
            </p>
          </div>
          {isTeacher && (
            <button
              type="button"
              className="chat-icon-btn shrink-0"
              onClick={() => refetchTeacherClasses()}
              disabled={teacherLoading}
              title={isEs ? "Actualizar" : "Refresh"}
            >
              <RefreshCw className={`w-4 h-4 ${teacherLoading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
        <div className="chat-list-card-content">
          {(isTeacher ? teacherLoading : studentLoading) && displayedClasses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--chat-text-tertiary)]" />
            </div>
          ) : displayedClasses.length === 0 ? (
            <div className="chat-list-empty-state">
              <strong>{isEs ? "Aún no hay grupos de chat" : "No chat groups yet"}</strong>
              <p className="text-sm">
                {isTeacher ? (isEs ? "Crea una clase abajo o actualiza si acabas de crear una." : "Create a class below to get a chat group, or refresh if you just created one.") : (isEs ? "Únete a una clase abajo con el código de tu profesor." : "Join a class below with an invite code from your teacher to see your groups here.")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {(isTeacher ? displayedClasses : (displayedClasses as EnrolledClass[])).map((item: Class | EnrolledClass) => {
                const cls = isTeacher ? (item as Class) : (item as EnrolledClass).class;
                const member = !isTeacher ? (item as EnrolledClass).member : null;
                return (
                  <div
                    key={cls.id}
                    className="chat-list-group-row"
                    onClick={() => setSelectedClassId(cls.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="chat-list-group-icon">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="chat-list-group-name">{cls.name}</p>
                        <p className="chat-list-group-meta">
                          {cls.subject && <span>{cls.subject}</span>}
                          {!isTeacher && member && (
                            <span className="ml-1">
                              • {(member as { status?: string }).status === "approved" ? (isEs ? "Aprobado" : "Approved") : (isEs ? "Pendiente" : "Pending approval")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isTeacher && (
                        <>
                          <span className="text-xs font-mono px-2 py-1 rounded-md border border-[var(--chat-border)] bg-[var(--chat-bg-secondary)] text-[var(--chat-text-secondary)]">
                            {cls.inviteCode}
                          </span>
                          <button
                            type="button"
                            className="chat-icon-btn"
                            onClick={() => copyInviteCode(cls.inviteCode)}
                            title={isEs ? "Copiar código" : "Copy code"}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="chat-icon-btn">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{isEs ? "Opciones de clase" : "Class options"}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setClassToDelete(cls.id);
                                  setDeleteClassDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isEs ? "Eliminar clase" : "Delete class"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                      <span className="text-[var(--chat-text-tertiary)] text-sm">
                        {!isTeacher && member && (member as { status?: string }).status === "pending" ? (isEs ? "Ver" : "View") : (isEs ? "Chat" : "Chat")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isTeacher && (
        <div className="chat-list-form-card">
          <div className="chat-list-form-header">
            <h2 className="chat-list-form-title">
              <Plus className="w-5 h-5 text-[var(--chat-primary)]" />
              {isEs ? "Crear nueva clase" : "Create New Class"}
            </h2>
            <p className="chat-list-card-description mt-1">
              {isEs ? "Crea una clase y comparte el código con tus estudiantes" : "Create a class and share the invite code with your students"}
            </p>
          </div>
          <div className="chat-list-form-content">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newClassName.trim()) createMutation.mutate({ name: newClassName.trim(), subject: newClassSubject.trim() || undefined });
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="class-name" className="chat-list-input-label">{isEs ? "Nombre de la clase" : "Class Name"}</label>
                <input
                  id="class-name"
                  type="text"
                  className="chat-list-input"
                  placeholder="e.g. Mathematics 101"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="class-subject" className="chat-list-input-label">{isEs ? "Materia (opcional)" : "Subject (optional)"}</label>
                <input
                  id="class-subject"
                  type="text"
                  className="chat-list-input"
                  placeholder="e.g. Algebra"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="chat-list-btn-primary"
                disabled={createMutation.isPending || !newClassName.trim()}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isEs ? "Crear clase" : "Create Class"}
              </button>
            </form>
          </div>
        </div>
      )}

      {!isTeacher && (
        <>
          <div className="chat-list-form-card">
            <div className="chat-list-form-header">
              <h2 className="chat-list-form-title">
                <GraduationCap className="w-5 h-5 text-[var(--chat-primary)]" />
                {t.classGroups?.yourTeachers ?? (isEs ? "Mis profesores" : "Your teachers")}
              </h2>
              <p className="chat-list-card-description mt-1">
                {t.classGroups?.yourTeachersDescription ?? (isEs
                  ? "Selecciona profesores para ver sus materiales. Únete a sus clases con el código que te den."
                  : "Select teachers to see their revision materials. Join their classes with the secret code they give you.")}
              </p>
            </div>
            <div className="chat-list-form-content space-y-4">
              {selectedTeachers.length > 0 && (
                <div className="space-y-2">
                  <label className="chat-list-input-label">{t.classGroups?.selected ?? (isEs ? "Seleccionados" : "Selected")}</label>
                  <ul className="space-y-2">
                    {selectedTeachers.map((teacher) => (
                      <li key={teacher.id} className="flex items-center justify-between p-3 rounded-[var(--chat-radius-md)] border border-[var(--chat-border)] bg-[var(--chat-bg-secondary)]">
                        <span className="font-medium text-[var(--chat-text-primary)]">
                          {[teacher.firstName, teacher.lastName].filter(Boolean).join(" ") || teacher.username}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeacherMutation.mutate(teacher.id)}
                          disabled={removeTeacherMutation.isPending}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          {t.classGroups?.remove ?? (isEs ? "Quitar" : "Remove")}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {availableTeachers.filter((teach) => !selectedTeachers.some((s) => s.id === teach.id)).length > 0 && (
                <div className="space-y-2">
                  <label className="chat-list-input-label">{t.classGroups?.addTeacher ?? (isEs ? "Agregar profesor" : "Add teacher")}</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTeachers
                      .filter((teach) => !selectedTeachers.some((s) => s.id === teach.id))
                      .map((teach) => (
                        <Button
                          key={teach.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addTeacherMutation.mutate(teach.id)}
                          disabled={addTeacherMutation.isPending}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          {[teach.firstName, teach.lastName].filter(Boolean).join(" ") || teach.username}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
              {availableTeachers.length === 0 && selectedTeachers.length === 0 && (
                <p className="text-sm text-[var(--chat-text-tertiary)]">
                  {isEs ? "No hay profesores registrados disponibles." : "No registered teachers available."}
                </p>
              )}
            </div>
          </div>

          <div className="chat-list-form-card">
            <div className="chat-list-form-header">
              <h2 className="chat-list-form-title">
                <Hash className="w-5 h-5 text-[var(--chat-primary)]" />
                {isEs ? "Unirse a una clase" : "Join a Class"}
              </h2>
              <p className="chat-list-card-description mt-1">
                {isEs ? "Ingresa el código de invitación que te dio tu profesor" : "Enter the invite code your teacher gave you"}
              </p>
            </div>
            <div className="chat-list-form-content">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inviteCode.trim()) joinMutation.mutate(inviteCode.trim());
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  className="chat-list-input flex-1"
                  placeholder="e.g. ABCD1234"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  style={{ fontFamily: "var(--chat-font)", textTransform: "uppercase" }}
                />
                <button
                  type="submit"
                  className="chat-list-btn-primary"
                  disabled={joinMutation.isPending || !inviteCode.trim()}
                >
                  {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isEs ? "Unirse" : "Join"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={deleteClassDialogOpen} onOpenChange={setDeleteClassDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEs ? "¿Eliminar esta clase?" : "Delete this class?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEs
                ? "Solo puedes eliminar una clase que no tenga miembros ni mensajes (por ejemplo, si la creaste por error). Si la clase tiene estudiantes o mensajes, no se puede eliminar."
                : "You can only delete a class that has no members and no messages (e.g. created by mistake). If the class has any students or chat messages, it cannot be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isEs ? "Cancelar" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => classToDelete != null && deleteClassMutation.mutate(classToDelete)}
              disabled={deleteClassMutation.isPending}
            >
              {deleteClassMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {isEs ? "Eliminar clase" : "Delete class"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PageLayout>
  );
}

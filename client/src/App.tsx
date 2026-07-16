import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { DataSaverProvider } from "./components/DataSaverMode";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sidebar } from "./components/Sidebar";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "./pages/Dashboard";
import StudyBuddy from "./pages/StudyBuddy";
import BudgetPal from "./pages/BudgetPal";
import Blog from "./pages/Blog";
import CruiseWord from "./pages/CruiseWord";
import CruiseWordLearn from "./pages/cruiseword/Learn";
import CruiseWordLesson from "./pages/cruiseword/Lesson";
import GameHub from "./pages/GameHub";
import MathMaster from "./pages/MathMaster";
import LinguaPlay from "./pages/LinguaPlay";
import AuthPage from "./pages/auth-page";
import AdminDashboard from "./pages/admin-dashboard";
import StudentRevision from "./pages/StudentRevision";
import DAO from "./pages/DAO";
import MentorshipHub from "./pages/MentorshipHub";
import MentorshipHubPage from "./pages/MentorshipHubPage";
import MentorApply from "./pages/MentorApply";
import ClassGroups from "./pages/ClassGroups";
import StudentProfile from "./pages/StudentProfile";
import LandingPage from "./pages/landing-page";
import NotFound from "@/pages/not-found";
import { Redirect } from "./components/Redirect";

function Router() {
  // Offline storage completely disabled
  // useEffect(() => {
  //   if (!OFFLINE_ENABLED) return;
  //   initializeOfflineStorage().then((success) => {
  //     if (success) {
  //       console.log('Offline storage initialized for Honduras platform');
  //     } else {
  //       console.warn('Offline storage initialization failed');
  //     }
  //   });
  // }, []);

  return (
    <LanguageProvider>
      <DataSaverProvider>
        <AuthProvider>
          <Switch>
          {/* Public routes */}
          <Route path="/auth" component={AuthPage} />
          <Route path="/mentor-apply" component={MentorApply} />
          {/* Centro de Mentores: public for guests, app layout for logged-in */}
          <Route path="/mentorship" component={MentorshipHubPage} />

          {/* Public landing page for unauthenticated users, redirect authenticated users */}
          <Route path="/">
            {() => {
              const { user } = useAuth();
              if (user) {
                return <Redirect to="/dashboard" />;
              }
              return <LandingPage />;
            }}
          </Route>
          
          {/* Admin panel route - standalone without sidebar */}
          <ProtectedRoute path="/admin" component={AdminDashboard} roles={['teacher', 'superuser']} />
          
          {/* Main application routes with sidebar */}
          <Route>
            {() => (
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 lg:ml-80 pt-16 lg:pt-0 bg-youth-surface min-h-screen">
                  <ErrorBoundary>
                  <Switch>
                    <ProtectedRoute path="/dashboard" component={Dashboard} />
                    <ProtectedRoute path="/studybuddy" component={StudyBuddy} />
                    <ProtectedRoute path="/profile" component={StudentProfile} roles={['student']} />
                    <ProtectedRoute path="/revision" component={StudentRevision} roles={['student']} />
                    <ProtectedRoute path="/budgetpal" component={BudgetPal} />
                    <ProtectedRoute path="/blog" component={Blog} />
                    <ProtectedRoute path="/games" component={GameHub} />
                    <ProtectedRoute path="/games/cruiseword" component={CruiseWord} />
                    <ProtectedRoute path="/games/cruiseword/learn" component={CruiseWordLearn} />
                    <ProtectedRoute path="/games/cruiseword/lesson" component={CruiseWordLesson} />
                    <ProtectedRoute path="/games/mathmaster" component={MathMaster} />
                    <ProtectedRoute path="/games/linguaplay" component={LinguaPlay} />
                    <Route path="/cruiseword">{() => <Redirect to="/games/cruiseword" />}</Route>
                    <ProtectedRoute path="/dao" component={DAO} />
                    <ProtectedRoute path="/classes" component={ClassGroups} />
                    <Route component={NotFound} />
                  </Switch>
                  </ErrorBoundary>
                </main>
              </div>
            )}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
        </AuthProvider>
      </DataSaverProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

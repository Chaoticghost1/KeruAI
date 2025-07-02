import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Sidebar } from "./components/Sidebar";
import Home from "./pages/Home";
import StudyBuddy from "./pages/StudyBuddy";
import BudgetPal from "./pages/BudgetPal";
import Blog from "./pages/Blog";
import Chat from "./pages/Chat";
import CruiseWord from "./pages/CruiseWord";
import DAO from "./pages/DAO";
import AethosByte from "./pages/AethosByte";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-80">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/studybuddy" component={StudyBuddy} />
          <Route path="/budgetpal" component={BudgetPal} />
          <Route path="/blog" component={Blog} />
          <Route path="/chat" component={Chat} />
          <Route path="/cruiseword" component={CruiseWord} />
          <Route path="/dao" component={DAO} />
          <Route path="/aethosbyte" component={AethosByte} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Router />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

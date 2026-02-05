import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/Dashboard";
import CommandCenter from "@/pages/CommandCenter";
import AgentBuilder from "@/pages/AgentBuilder";
import LogAnalysis from "@/pages/LogAnalysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/commands" component={CommandCenter} />
      <Route path="/agent" component={AgentBuilder} />
      <Route path="/agents">
        <Redirect to="/agent" />
      </Route>
      <Route path="/builder">
        <Redirect to="/agent" />
      </Route>
      <Route path="/logs" component={LogAnalysis} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

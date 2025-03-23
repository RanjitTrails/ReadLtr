import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/api.tsx";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Overview from "@/pages/overview";
import Setup from "@/pages/setup";
import Configuration from "@/pages/configuration";
import Deployment from "@/pages/deployment";
import FAQ from "@/pages/faq";
import Library from "@/pages/library";
import Article from "@/pages/article";
import Integrations from "@/pages/integrations";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/overview" component={Overview} />
      <Route path="/setup" component={Setup} />
      <Route path="/configuration" component={Configuration} />
      <Route path="/deployment" component={Deployment} />
      <Route path="/faq" component={FAQ} />
      <Route path="/library" component={Library} />
      <Route path="/article/:id" component={Article} />
      <Route path="/integrations" component={Integrations} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

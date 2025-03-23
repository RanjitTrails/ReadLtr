import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToasterProvider } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/api.tsx";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import List from "@/pages/list";
import Favorites from "@/pages/favorites";
import Archive from "@/pages/archive";
import Tags from "@/pages/tags";
import Article from "@/pages/article";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import SaveArticle from "@/pages/save";
import MobileAppPage from "@/pages/mobile";
import Bookmarklet from "@/components/browser-extension/Bookmarklet";
import ChromeExtension from "@/components/browser-extension/ChromeExtension";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/list" component={List} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/archive" component={Archive} />
      <Route path="/tags" component={Tags} />
      <Route path="/tags/:tag" component={Tags} />
      <Route path="/article/:id" component={Article} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route path="/save" component={SaveArticle} />
      <Route path="/mobile" component={MobileAppPage} />
      <Route path="/extensions/bookmarklet">
        {() => (
          <div className="container mx-auto p-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Browser Extensions</h1>
            <Bookmarklet />
          </div>
        )}
      </Route>
      <Route path="/extensions/chrome">
        {() => (
          <div className="container mx-auto p-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Browser Extensions</h1>
            <ChromeExtension />
          </div>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToasterProvider>
          <Router />
        </ToasterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

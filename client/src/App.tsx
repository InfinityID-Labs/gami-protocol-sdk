import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import TutorialProvider from "@/components/TutorialProvider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SdkConfig from "@/pages/sdk-config";
import XPManagement from "@/pages/xp-management";
import WalletIntegration from "@/pages/wallet-integration";
import Campaigns from "@/pages/campaigns";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Documentation from "@/pages/documentation";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import WalletTestPage from "@/pages/wallet-test";
import EcommercePage from "@/pages/ecommerce";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/sdk-config" component={SdkConfig} />
      <ProtectedRoute path="/xp-management" component={XPManagement} />
      <ProtectedRoute path="/wallet-integration" component={WalletIntegration} />
      <ProtectedRoute path="/campaigns" component={Campaigns} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/documentation" component={Documentation} />
      <ProtectedRoute path="/ecommerce" component={EcommercePage} />
      <Route path="/wallet-test" component={WalletTestPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TutorialProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </TutorialProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

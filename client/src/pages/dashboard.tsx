import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import StatsCard from "@/components/dashboard/StatsCard";
import SDKIntegration from "@/components/dashboard/SDKIntegration";
import XPTrackingTable from "@/components/dashboard/XPTrackingTable";
import ApiStatus from "@/components/dashboard/ApiStatus";
import WalletIntegration from "@/components/dashboard/WalletIntegration";
import QuickActions from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTutorial } from "@/hooks/use-tutorial";
import { 
  FaUsers, 
  FaTrophy, 
  FaRocket, 
  FaWallet 
} from "react-icons/fa";

interface DashboardStats {
  activeUsers: number;
  xpTransactions: number;
  activeCampaigns: number;
  rewardsDistributed: number;
}

interface XPEvent {
  eventName: string;
  count: number;
  avgXp: number;
  status: string;
}

interface WalletProvider {
  id: number;
  walletType: string;
  isEnabled: boolean;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { startTutorial, forceStartTutorial, hasSeenTutorial } = useTutorial('dashboard');
  
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch XP events
  const { data: events, isLoading: isLoadingEvents } = useQuery<XPEvent[]>({
    queryKey: ['/api/admin/events'],
  });

  // Fetch wallet integrations
  const { data: wallets, isLoading: isLoadingWallets, refetch: refetchWallets } = useQuery<WalletProvider[]>({
    queryKey: ['/api/admin/wallet-integrations'],
  });
  
  // Start the tutorial when the component mounts
  useEffect(() => {
    // Wait for data to be loaded before starting the tutorial
    if (!isLoadingStats && !isLoadingEvents && !isLoadingWallets) {
      // Use a slight delay to ensure DOM elements are fully rendered
      const timer = setTimeout(() => {
        startTutorial();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoadingStats, isLoadingEvents, isLoadingWallets, startTutorial]);

  // API services status
  const apiServices = [
    { name: "SDK API", uptime: "99.9%", status: "operational" as const },
    { name: "GraphQL Endpoint", uptime: "99.7%", status: "operational" as const },
    { name: "Solana Integration", uptime: "99.8%", status: "operational" as const },
    { name: "Webhook Service", uptime: "97.2%", status: "degraded" as const }
  ];

  // Update wallet integration
  const updateWalletIntegration = async (id: number, isEnabled: boolean) => {
    try {
      await apiRequest('PATCH', `/api/admin/wallet-integrations/${id}`, { isEnabled });
      await refetchWallets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wallet integration",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-8 dashboard-overview">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your Gami Protocol SDK integration and monitor XP tracking
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button variant="outline">Documentation</Button>
            <Button onClick={() => forceStartTutorial()}>Help Guide</Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Active Users"
            value={isLoadingStats ? "Loading..." : stats?.activeUsers.toLocaleString() || "0"}
            icon={<FaUsers className="text-blue-500" />}
            iconBgColor="bg-blue-50"
            change={{ value: "12% increase", positive: true }}
          />
          <StatsCard
            title="XP Transactions"
            value={isLoadingStats ? "Loading..." : stats?.xpTransactions.toLocaleString() || "0"}
            icon={<FaTrophy className="text-green-500" />}
            iconBgColor="bg-green-50"
            change={{ value: "8% increase", positive: true }}
          />
          <StatsCard
            title="Active Campaigns"
            value={isLoadingStats ? "Loading..." : stats?.activeCampaigns.toString() || "0"}
            icon={<FaRocket className="text-amber-500" />}
            iconBgColor="bg-amber-50"
            footer={{ text: "3 ending soon" }}
          />
          <StatsCard
            title="Rewards Distributed"
            value={isLoadingStats ? "Loading..." : `${stats?.rewardsDistributed.toLocaleString() || "0"} GAMI`}
            icon={<FaWallet className="text-purple-500" />}
            iconBgColor="bg-purple-50"
            change={{ value: "5% increase", positive: true }}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SDK Integration Column */}
          <div className="lg:col-span-2 space-y-6 projects-list">
            <SDKIntegration
              sdkVersion="1.2.4"
              apiKey={isLoadingStats ? "loading..." : "gami_0123456789abcdef"}
            />
            
            <XPTrackingTable
              events={events || []}
              isLoading={isLoadingEvents}
            />
          </div>
          
          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            <ApiStatus services={apiServices} />
            
            <WalletIntegration
              wallets={wallets || []}
              onUpdate={updateWalletIntegration}
              isLoading={isLoadingWallets}
            />
            
            <QuickActions className="quick-actions" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

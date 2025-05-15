import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WalletProvider {
  id: number;
  walletType: string;
  isEnabled: boolean;
}

interface WalletIntegrationProps {
  wallets: WalletProvider[];
  onUpdate: (id: number, isEnabled: boolean) => Promise<void>;
  isLoading?: boolean;
}

export default function WalletIntegration({ 
  wallets, 
  onUpdate,
  isLoading = false 
}: WalletIntegrationProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const getWalletDetails = (type: string) => {
    switch (type) {
      case "phantom":
        return {
          name: "Phantom",
          logo: "https://phantom.app/img/logo.png"
        };
      case "solflare":
        return {
          name: "Solflare",
          logo: "https://solflare.com/assets/logo.svg"
        };
      case "walletconnect":
        return {
          name: "WalletConnect",
          logo: "https://walletconnect.com/walletconnect-logo.png"
        };
      default:
        return {
          name: type.charAt(0).toUpperCase() + type.slice(1),
          logo: ""
        };
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // This would typically update all wallet settings at once
      toast({
        title: "Settings saved",
        description: "Wallet integration settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wallet settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-lg font-medium text-slate-900">Wallet Integration</h3>
      </div>
      <div className="p-5">
        <div className="text-sm text-slate-600 mb-4">
          Configure wallet connections for your application:
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            wallets.map((wallet) => {
              const { name, logo } = getWalletDetails(wallet.walletType);
              return (
                <div key={wallet.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 mr-3 flex items-center justify-center rounded bg-slate-100">
                      {logo ? (
                        <img src={logo} alt={name} className="h-6 w-6" />
                      ) : (
                        <span className="text-xs font-medium">{name.slice(0, 2)}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{name}</span>
                  </div>
                  <Switch
                    checked={wallet.isEnabled}
                    onCheckedChange={async (checked) => {
                      await onUpdate(wallet.id, checked);
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-4">
        <Button 
          className="w-full" 
          onClick={handleSaveSettings}
          disabled={saving || isLoading}
        >
          {saving ? "Saving..." : "Save Wallet Settings"}
        </Button>
      </div>
    </Card>
  );
}

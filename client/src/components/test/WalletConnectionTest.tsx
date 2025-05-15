import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GamiSDK } from "@/sdk";

// Simple test component to verify wallet connection
export default function WalletConnectionTest() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Initialize SDK with test key
  const gamiSDK = new GamiSDK({
    apiKey: 'test-api-key-123',
    environment: 'development'
  });
  
  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const result = await gamiSDK.connectWallet({
        walletType: 'phantom',
        onSuccess: (publicKey) => {
          console.log('Connected wallet:', publicKey);
          toast({
            title: "Success",
            description: `Connected to wallet: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
          });
        },
        onError: (error) => {
          console.error('Connection error:', error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
      
      if (result.success && result.publicKey) {
        setWalletAddress(result.publicKey);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnectWallet = async () => {
    if (!walletAddress) return;
    
    try {
      const success = await gamiSDK.disconnectWallet(walletAddress);
      if (success) {
        setWalletAddress(null);
        toast({
          title: "Success",
          description: "Wallet disconnected",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Wallet Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        {walletAddress ? (
          <div className="space-y-4">
            <p className="text-sm bg-slate-100 p-2 rounded">
              Connected to: {walletAddress}
            </p>
            <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
          </div>
        ) : (
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
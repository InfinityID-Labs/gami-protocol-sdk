import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, InfoIcon, ArrowRightIcon, WalletIcon, CoinsIcon, ArrowDownIcon } from "lucide-react";
import { GamiSDK, TransferStatus, ChainType } from "@/sdk";

interface WalletProvider {
  id: number;
  walletType: string;
  isEnabled: boolean;
  config?: Record<string, any>;
}

// Initialize SDK
const gamiSDK = new GamiSDK({ 
  apiKey: 'test-api-key-123',
  environment: 'development'
});

// Wallet Connect Demo Component
function WalletConnectDemo() {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalances, setWalletBalances] = useState<Array<{token: string, amount: number, usdValue?: number}>>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  // Connect wallet function
  const connectWallet = async (walletType: 'phantom' | 'solflare') => {
    setConnecting(true);
    try {
      const result = await gamiSDK.connectWallet({
        walletType,
        onSuccess: (publicKey) => {
          console.log('Connected wallet:', publicKey);
          toast({
            title: "Wallet Connected",
            description: `Successfully connected ${walletType} wallet`,
          });
        },
        onError: (error) => {
          console.error('Wallet connection error:', error);
          toast({
            title: "Connection Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      });
      
      if (result.success && result.publicKey) {
        setWalletAddress(result.publicKey);
        fetchWalletBalances(result.publicKey);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };
  
  // Disconnect wallet function
  const disconnectWallet = async () => {
    if (!walletAddress) return;
    
    try {
      const success = await gamiSDK.disconnectWallet(walletAddress);
      if (success) {
        setWalletAddress(null);
        setWalletBalances([]);
        toast({
          title: "Wallet Disconnected",
          description: "Successfully disconnected wallet",
        });
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Fetch wallet balances
  const fetchWalletBalances = async (publicKey: string) => {
    setIsLoadingBalances(true);
    try {
      const result = await gamiSDK.getTokenBalances(publicKey);
      if (result.success && result.balances) {
        setWalletBalances(result.balances);
      } else {
        toast({
          title: "Failed to fetch balances",
          description: result.error?.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBalances(false);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5" />
          Wallet Connection Demo
        </CardTitle>
        <CardDescription>
          Connect to wallets and view token balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!walletAddress ? (
          <div className="space-y-4">
            <div className="text-center p-6 border rounded-lg border-dashed border-slate-300 bg-slate-50">
              <h3 className="text-lg font-medium mb-2">Connect a Wallet</h3>
              <p className="text-sm text-slate-500 mb-4">
                Connect to a Solana wallet to view your token balances and interact with the blockchain
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => connectWallet('phantom')}
                  disabled={connecting}
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Connect Phantom
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => connectWallet('solflare')}
                  disabled={connecting}
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Connect Solflare
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Connected Wallet</h3>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
              <div className="bg-slate-100 p-3 rounded-md font-mono text-xs break-all">
                {walletAddress}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Token Balances</h3>
              {isLoadingBalances ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : walletBalances.length === 0 ? (
                <div className="text-center p-6 border rounded-lg border-dashed">
                  <p className="text-sm text-slate-500">No tokens found in this wallet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {walletBalances.map((balance, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <CoinsIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{balance.token}</p>
                          {balance.usdValue && (
                            <p className="text-xs text-slate-500">${balance.usdValue.toFixed(2)} USD</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{balance.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Cross-Chain Transfer Demo Component
function CrossChainTransferDemo() {
  const { toast } = useToast();
  const [fromChain, setFromChain] = useState<ChainType>('solana');
  const [toChain, setToChain] = useState<ChainType>('ethereum');
  const [amount, setAmount] = useState<string>('10');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [transferring, setTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<TransferStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [supportedChains, setSupportedChains] = useState<ChainType[]>([]);
  const [feeEstimate, setFeeEstimate] = useState<{ fee: number; token: string } | null>(null);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  
  // Load supported chains
  useEffect(() => {
    async function loadChains() {
      try {
        const chains = await gamiSDK.getSupportedChains();
        setSupportedChains(chains);
      } catch (error) {
        console.error('Failed to load supported chains:', error);
        // Default fallback
        setSupportedChains(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc']);
      }
    }
    
    loadChains();
  }, []);
  
  // Update fee estimate when amount or chains change
  useEffect(() => {
    async function updateFeeEstimate() {
      if (!amount || isNaN(parseFloat(amount))) return;
      
      setIsLoadingFee(true);
      try {
        const fee = await gamiSDK.getCrossChainFeeEstimate(
          fromChain,
          toChain,
          parseFloat(amount)
        );
        setFeeEstimate(fee);
      } catch (error) {
        console.error('Failed to get fee estimate:', error);
        setFeeEstimate(null);
      } finally {
        setIsLoadingFee(false);
      }
    }
    
    updateFeeEstimate();
  }, [fromChain, toChain, amount]);
  
  // Handle transfer status updates
  const handleStatusChange = (status: TransferStatus) => {
    setTransferStatus(status);
    
    // Update progress based on status
    switch (status) {
      case TransferStatus.INITIATED:
        setProgress(10);
        break;
      case TransferStatus.SOURCE_TRANSFER_PENDING:
        setProgress(30);
        break;
      case TransferStatus.SOURCE_TRANSFER_COMPLETE:
        setProgress(50);
        break;
      case TransferStatus.WORMHOLE_RELAY_PENDING:
        setProgress(70);
        break;
      case TransferStatus.DESTINATION_TRANSFER_PENDING:
        setProgress(90);
        break;
      case TransferStatus.COMPLETED:
        setProgress(100);
        toast({
          title: "Transfer Complete",
          description: "Your cross-chain transfer has completed successfully!",
        });
        break;
      case TransferStatus.FAILED:
        setProgress(0);
        toast({
          title: "Transfer Failed",
          description: "Your cross-chain transfer failed. Please try again.",
          variant: "destructive",
        });
        break;
    }
  };
  
  // Initialize transfer
  const startTransfer = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to transfer",
        variant: "destructive",
      });
      return;
    }
    
    if (!destinationAddress) {
      toast({
        title: "Missing Destination",
        description: "Please enter a destination address",
        variant: "destructive",
      });
      return;
    }
    
    setTransferring(true);
    setTransferStatus(null);
    setProgress(0);
    
    try {
      // Mock wallet public key for demo purposes
      const walletPublicKey = "11112222333344445555666677778888";
      
      const result = await gamiSDK.transferTokensCrossChain({
        fromChain,
        toChain,
        amount: parseFloat(amount),
        tokenAddress: "GAMI", // Using a token symbol for simplicity
        destinationAddress,
        walletPublicKey,
        onStatusChange: handleStatusChange
      });
      
      if (result.success) {
        toast({
          title: "Transfer Initiated",
          description: `Transfer ID: ${result.transferId}`,
        });
      } else {
        toast({
          title: "Transfer Failed",
          description: result.error?.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to initiate transfer:', error);
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setTransferring(false);
    }
  };
  
  // Render status badge
  const renderStatusBadge = () => {
    if (!transferStatus) return null;
    
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    
    if (transferStatus === TransferStatus.FAILED) {
      variant = 'destructive';
    } else if (transferStatus !== TransferStatus.COMPLETED) {
      variant = 'secondary';
    }
    
    return (
      <Badge variant={variant} className="mb-2">
        {transferStatus.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };
  
  // Format status for display
  const formatStatus = (status: TransferStatus): string => {
    return status.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightIcon className="h-5 w-5" />
          Cross-Chain Transfer
        </CardTitle>
        <CardDescription>
          Transfer tokens between different blockchains
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromChain">From Chain</Label>
              <Select
                value={fromChain}
                onValueChange={(value) => setFromChain(value as ChainType)}
                disabled={transferring}
              >
                <SelectTrigger id="fromChain">
                  <SelectValue placeholder="Select source chain" />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toChain">To Chain</Label>
              <Select
                value={toChain}
                onValueChange={(value) => setToChain(value as ChainType)}
                disabled={transferring}
              >
                <SelectTrigger id="toChain">
                  <SelectValue placeholder="Select destination chain" />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains
                    .filter(chain => chain !== fromChain)
                    .map((chain) => (
                      <SelectItem key={chain} value={chain}>
                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={transferring}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Address</Label>
            <Input
              id="destination"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder={`Enter ${toChain} destination address`}
              disabled={transferring}
            />
          </div>
          
          {feeEstimate && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm">
                Estimated Fee: <span className="font-medium">{feeEstimate.fee} {feeEstimate.token}</span>
              </p>
            </div>
          )}
          
          {transferStatus && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Transfer Status</p>
                {renderStatusBadge()}
              </div>
              <Progress value={progress} />
              <p className="text-xs text-slate-500">
                {formatStatus(transferStatus)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={startTransfer}
          disabled={transferring}
        >
          {transferring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowDownIcon className="mr-2 h-4 w-4" />
              Transfer Tokens
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WalletIntegration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wallets");

  // Fetch wallet integrations
  const { data: wallets = [], isLoading } = useQuery<WalletProvider[]>({
    queryKey: ['/api/admin/wallet-integrations'],
  });

  // Update wallet integration
  const updateWalletIntegration = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: number; isEnabled: boolean }) => {
      return apiRequest('PATCH', `/api/admin/wallet-integrations/${id}`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet-integrations'] });
      toast({
        title: "Wallet integration updated",
        description: "Wallet integration settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet integration",
        variant: "destructive",
      });
    },
  });

  const saveAllSettings = async () => {
    try {
      await Promise.all(wallets.map(wallet => 
        updateWalletIntegration.mutate({ id: wallet.id, isEnabled: wallet.isEnabled })
      ));
      
      toast({
        title: "Settings saved",
        description: "All wallet integration settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wallet settings.",
        variant: "destructive",
      });
    }
  };

  const getWalletDetails = (type: string) => {
    switch (type) {
      case "phantom":
        return {
          name: "Phantom",
          logo: "https://phantom.app/img/logo.png",
          description: "The friendly Solana wallet built for DeFi & NFTs",
          url: "https://phantom.app/"
        };
      case "solflare":
        return {
          name: "Solflare",
          logo: "https://solflare.com/assets/logo.svg",
          description: "Non-custodial wallet for the Solana blockchain",
          url: "https://solflare.com/"
        };
      case "walletconnect":
        return {
          name: "WalletConnect",
          logo: "https://walletconnect.com/walletconnect-logo.png",
          description: "Open protocol for connecting wallets to dApps",
          url: "https://walletconnect.com/"
        };
      default:
        return {
          name: type.charAt(0).toUpperCase() + type.slice(1),
          logo: "",
          description: "Custom wallet integration",
          url: "#"
        };
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">Wallet Integration</h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure wallet connections for your gamification platform
            </p>
          </div>
        </div>

        <Tabs defaultValue="wallets" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallets">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Providers</CardTitle>
                <CardDescription>
                  Enable or disable wallet providers for your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-slate-500">Loading wallet providers...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {wallets.map((wallet) => {
                      const { name, logo, description, url } = getWalletDetails(wallet.walletType);
                      return (
                        <div key={wallet.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex items-center justify-center bg-slate-100 rounded-lg">
                              {logo ? (
                                <img src={logo} alt={name} className="h-8 w-8 rounded" />
                              ) : (
                                <span className="text-lg font-medium">{name.slice(0, 2)}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{name}</h3>
                              <p className="text-sm text-slate-500">{description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={wallet.isEnabled ? "default" : "secondary"}>
                              {wallet.isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                            <Switch
                              checked={wallet.isEnabled}
                              onCheckedChange={(checked) => 
                                updateWalletIntegration.mutate({ id: wallet.id, isEnabled: checked })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-end mt-6">
                      <Button onClick={saveAllSettings} disabled={updateWalletIntegration.isPending}>
                        {updateWalletIntegration.isPending ? "Saving..." : "Save All Settings"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert className="mt-8">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                Users will only be able to connect with the wallet providers you have enabled. Make sure to test wallet connections before enabling them in production.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="demo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet connect and cross-chain demos directly embedded here */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" />
                    Wallet Connection Demo
                  </CardTitle>
                  <CardDescription>
                    Connect to wallets and view token balances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 border rounded-lg border-dashed border-slate-300 bg-slate-50">
                      <h3 className="text-lg font-medium mb-2">Connect a Wallet</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Connect to a Solana wallet to view your token balances and interact with the blockchain
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          Connect Phantom
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          Connect Solflare
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightIcon className="h-5 w-5" />
                    Cross-Chain Transfer
                  </CardTitle>
                  <CardDescription>
                    Transfer tokens between different blockchains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromChain">From Chain</Label>
                        <Select defaultValue="solana">
                          <SelectTrigger id="fromChain">
                            <SelectValue placeholder="Select source chain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solana">Solana</SelectItem>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="toChain">To Chain</Label>
                        <Select defaultValue="ethereum">
                          <SelectTrigger id="toChain">
                            <SelectValue placeholder="Select destination chain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="avalanche">Avalanche</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        defaultValue="10"
                        placeholder="Enter amount"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination Address</Label>
                      <Input
                        id="destination"
                        placeholder="Enter destination address"
                      />
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm">
                        Estimated Fee: <span className="font-medium">0.005 ETH</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <ArrowDownIcon className="mr-2 h-4 w-4" />
                    Transfer Tokens
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Connection Settings</CardTitle>
                <CardDescription>
                  Configure general settings for wallet connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Auto-Connect</h3>
                      <p className="text-sm text-slate-500">Automatically attempt to reconnect to the previously used wallet</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Display Wallet Selector</h3>
                      <p className="text-sm text-slate-500">Show wallet selection UI when multiple wallets are available</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Require Wallet Connection</h3>
                      <p className="text-sm text-slate-500">Require users to connect a wallet before earning rewards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Enable Transaction Notifications</h3>
                      <p className="text-sm text-slate-500">Show notifications for successful wallet transactions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="implementation">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Guide</CardTitle>
                <CardDescription>
                  How to integrate wallet connections in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-2">1. Add the SDK to your project</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`npm install @gami-protocol/sdk`}</pre>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">2. Initialize the SDK</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`import { GamiSDK } from '@gami-protocol/sdk';

const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key-here',
  projectId: 'your-project-id',
  environment: 'production'
});`}</pre>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">3. Connect to a wallet</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`// Connect to a wallet
async function connectWallet() {
  try {
    const result = await gamiSDK.connectWallet({
      walletType: 'phantom', // or 'solflare'
      onSuccess: (publicKey) => {
        console.log('Connected wallet:', publicKey);
        // Update your UI to show connected state
      },
      onError: (error) => {
        console.error('Wallet connection error:', error);
        // Handle connection error
      }
    });
    
    if (result.success) {
      // Connection successful
      return result.publicKey;
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
  }
}`}</pre>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">4. Create a wallet connection button</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`function WalletConnectButton() {
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  async function handleConnect() {
    setConnecting(true);
    try {
      const publicKey = await connectWallet();
      setWalletAddress(publicKey);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={connecting}
    >
      {connecting ? 'Connecting...' : walletAddress ? 'Connected' : 'Connect Wallet'}
    </button>
  );
}`}</pre>
                    </div>
                  </div>

                  <Alert className="mt-4">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Best Practices</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Always handle connection errors gracefully</li>
                        <li>Store wallet connection state in your application</li>
                        <li>Provide clear guidance to users who don't have a wallet installed</li>
                        <li>Test your integration thoroughly with each enabled wallet provider</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  EcommerceIntegration, 
  PartnerRegistrationData, 
  CustomerOnboardingData, 
  AwardPointsData, 
  RedeemPointsData,
  TransactionType
} from '../sdk/ecommerce-integration';

export default function EcommercePage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [sdkInstance, setSdkInstance] = useState<EcommerceIntegration | null>(null);

  // Partner form
  const [partnerName, setPartnerName] = useState('');
  const [partnerDeepLinkUrl, setPartnerDeepLinkUrl] = useState('');

  // Customer form
  const [partnerId, setPartnerId] = useState('');
  const [externalCustomerId, setExternalCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Points form
  const [pointsAmount, setPointsAmount] = useState(0);
  const [pointsPurpose, setPointsPurpose] = useState('');

  // QR and deep link
  const [universalId, setUniversalId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [deepLink, setDeepLink] = useState('');
  
  // Shadow account
  const [claimCode, setClaimCode] = useState('');
  const [walletPublicKey, setWalletPublicKey] = useState('');
  const [shadowAccountInfo, setShadowAccountInfo] = useState<{ points: number; partnerName: string; universalId: string } | null>(null);
  const [shadowPartnerId, setShadowPartnerId] = useState('');

  // Initialize SDK
  const initializeSDK = () => {
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter an API key to initialize the SDK',
        variant: 'destructive'
      });
      return;
    }

    try {
      const sdk = new EcommerceIntegration(apiKey);
      setSdkInstance(sdk);
      toast({
        title: 'SDK Initialized',
        description: 'E-commerce integration SDK is ready to use',
      });
    } catch (error) {
      toast({
        title: 'Initialization Failed',
        description: error instanceof Error ? error.message : 'Could not initialize SDK',
        variant: 'destructive'
      });
    }
  };

  // Register a partner
  const registerPartner = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerName) {
      toast({
        title: 'Partner Name Required',
        description: 'Please enter a partner name',
        variant: 'destructive'
      });
      return;
    }

    try {
      const partnerData: PartnerRegistrationData = {
        partnerName,
        deepLinkUrl: partnerDeepLinkUrl || undefined
      };

      const result = await sdkInstance.registerPartner(partnerData);
      toast({
        title: 'Partner Registered',
        description: `Partner ID: ${result.partnerId}`,
      });

      // Set the partner ID for customer onboarding
      setPartnerId(result.partnerId);
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to register partner',
        variant: 'destructive'
      });
    }
  };

  // Onboard a customer
  const onboardCustomer = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID and External Customer ID are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const customerData: CustomerOnboardingData = {
        partnerId,
        externalCustomerId,
        name: customerName || undefined,
        email: customerEmail || undefined
      };

      const result = await sdkInstance.onboardCustomer(customerData);
      
      toast({
        title: 'Customer Onboarded',
        description: `Universal ID: ${result.universalId}`,
      });

      // Set universal ID, QR code and deep link
      setUniversalId(result.universalId);
      setQrCode(result.qrCode);
      setDeepLink(result.deepLink);
    } catch (error) {
      toast({
        title: 'Onboarding Failed',
        description: error instanceof Error ? error.message : 'Failed to onboard customer',
        variant: 'destructive'
      });
    }
  };

  // Award points
  const awardPoints = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId || pointsAmount <= 0) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID, External Customer ID, and a positive Points Amount are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const pointsData: AwardPointsData = {
        partnerId,
        externalCustomerId,
        points: pointsAmount,
        metadata: {
          note: 'Points awarded via SDK integration demo'
        }
      };

      const result = await sdkInstance.awardPoints(pointsData);
      toast({
        title: 'Points Awarded',
        description: `Added ${pointsAmount} points. New balance: ${result.balance}`,
      });
    } catch (error) {
      toast({
        title: 'Award Failed',
        description: error instanceof Error ? error.message : 'Failed to award points',
        variant: 'destructive'
      });
    }
  };

  // Redeem points
  const redeemPoints = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId || pointsAmount <= 0 || !pointsPurpose) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID, External Customer ID, Points Amount, and Purpose are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const pointsData: RedeemPointsData = {
        partnerId,
        externalCustomerId,
        points: pointsAmount,
        purpose: pointsPurpose,
        metadata: {
          note: 'Points redeemed via SDK integration demo'
        }
      };

      const result = await sdkInstance.redeemPoints(pointsData);
      toast({
        title: 'Points Redeemed',
        description: `Redeemed ${pointsAmount} points. New balance: ${result.balance}`,
      });
    } catch (error) {
      toast({
        title: 'Redemption Failed',
        description: error instanceof Error ? error.message : 'Failed to redeem points',
        variant: 'destructive'
      });
    }
  };

  // Check balance
  const checkBalance = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID and External Customer ID are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await sdkInstance.getCustomerBalance(externalCustomerId, partnerId);
      toast({
        title: 'Current Balance',
        description: `Customer has ${result.balance} points`,
      });
    } catch (error) {
      toast({
        title: 'Balance Check Failed',
        description: error instanceof Error ? error.message : 'Failed to check balance',
        variant: 'destructive'
      });
    }
  };
  
  // Create a shadow customer (customer without app)
  const createShadowCustomer = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID and External Customer ID are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const customerData = {
        partnerId,
        externalCustomerId,
        name: customerName || undefined,
        email: customerEmail || undefined
      };

      const result = await sdkInstance.createShadowCustomer(customerData);
      
      toast({
        title: 'Shadow Customer Created',
        description: `Claim Code: ${result.claimCode}`,
      });
      
      // Set the claim code for later use
      setClaimCode(result.claimCode);
    } catch (error) {
      toast({
        title: 'Shadow Customer Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create shadow customer',
        variant: 'destructive'
      });
    }
  };
  
  // Validate a claim code
  const validateClaimCode = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!claimCode) {
      toast({
        title: 'Claim Code Required',
        description: 'Please enter a claim code',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await sdkInstance.validateClaimCode(claimCode);
      
      toast({
        title: 'Claim Code Valid',
        description: `${result.points} points available from ${result.partnerName}`,
      });
      
      // Store the shadow account info
      setShadowAccountInfo(result);
    } catch (error) {
      toast({
        title: 'Claim Code Invalid',
        description: error instanceof Error ? error.message : 'Failed to validate claim code',
        variant: 'destructive'
      });
    }
  };
  
  // Activate a shadow account
  const activateShadowAccount = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!claimCode || !walletPublicKey) {
      toast({
        title: 'Required Fields Missing',
        description: 'Claim Code and Wallet Public Key are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const activationData = {
        claimCode,
        walletPublicKey,
        email: customerEmail || undefined
      };

      const result = await sdkInstance.activateShadowAccount(activationData);
      
      toast({
        title: 'Account Activated',
        description: `${result.points} points migrated to your account`,
      });
      
      // Clear the shadow account info
      setShadowAccountInfo(null);
      setClaimCode('');
    } catch (error) {
      toast({
        title: 'Activation Failed',
        description: error instanceof Error ? error.message : 'Failed to activate shadow account',
        variant: 'destructive'
      });
    }
  };
  
  // Get all shadow accounts for a partner
  const getShadowAccounts = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!shadowPartnerId) {
      toast({
        title: 'Partner ID Required',
        description: 'Please enter a partner ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await sdkInstance.getPartnerShadowAccounts(shadowPartnerId);
      
      toast({
        title: 'Shadow Accounts Retrieved',
        description: `Found ${result.accounts.length} shadow accounts`,
      });
      
      // You can display the list of shadow accounts in the UI
      console.log('Shadow accounts:', result.accounts);
    } catch (error) {
      toast({
        title: 'Retrieval Failed',
        description: error instanceof Error ? error.message : 'Failed to get shadow accounts',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">E-commerce Integration Demo</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Initialize SDK</CardTitle>
          <CardDescription>Enter your API key to initialize the E-commerce SDK</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your API Key"
              className="flex-1"
            />
            <Button onClick={initializeSDK}>Initialize</Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="partner" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="partner">Register Partner</TabsTrigger>
          <TabsTrigger value="customer">Onboard Customer</TabsTrigger>
          <TabsTrigger value="points">Manage Points</TabsTrigger>
          <TabsTrigger value="shadow">Shadow Accounts</TabsTrigger>
          <TabsTrigger value="qr">QR & Deep Links</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="partner">
          <Card>
            <CardHeader>
              <CardTitle>Partner Registration</CardTitle>
              <CardDescription>Register a new partner business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Partner Name</Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="My E-commerce Store"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deepLinkUrl">Deep Link URL (Optional)</Label>
                <Input
                  id="deepLinkUrl"
                  value={partnerDeepLinkUrl}
                  onChange={(e) => setPartnerDeepLinkUrl(e.target.value)}
                  placeholder="myapp://open"
                />
              </div>
              
              <Button onClick={registerPartner} className="w-full">Register Partner</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Onboarding</CardTitle>
              <CardDescription>Onboard a new customer to the universal system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerId">Partner ID</Label>
                  <Input
                    id="partnerId"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder="partner_123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="externalCustomerId">External Customer ID</Label>
                  <Input
                    id="externalCustomerId"
                    value={externalCustomerId}
                    onChange={(e) => setExternalCustomerId(e.target.value)}
                    placeholder="customer_456"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <Button onClick={onboardCustomer} className="w-full">Onboard Customer</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Points Management</CardTitle>
              <CardDescription>Award and redeem points for customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerId2">Partner ID</Label>
                  <Input
                    id="partnerId2"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder="partner_123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="externalCustomerId2">External Customer ID</Label>
                  <Input
                    id="externalCustomerId2"
                    value={externalCustomerId}
                    onChange={(e) => setExternalCustomerId(e.target.value)}
                    placeholder="customer_456"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsAmount">Points Amount</Label>
                  <Input
                    id="pointsAmount"
                    type="number"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(Number(e.target.value))}
                    placeholder="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pointsPurpose">Purpose (for redemption)</Label>
                  <Input
                    id="pointsPurpose"
                    value={pointsPurpose}
                    onChange={(e) => setPointsPurpose(e.target.value)}
                    placeholder="Store discount"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Button onClick={awardPoints} variant="default">Award Points</Button>
                <Button onClick={redeemPoints} variant="secondary">Redeem Points</Button>
                <Button onClick={checkBalance} variant="outline">Check Balance</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shadow">
          <div className="grid grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Create Shadow Customer</CardTitle>
                <CardDescription>Create a customer profile for users who don't have the app yet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shadowPartnerId">Partner ID</Label>
                      <Input
                        id="shadowPartnerId"
                        value={partnerId}
                        onChange={(e) => setPartnerId(e.target.value)}
                        placeholder="partner_123"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shadowCustomerId">External Customer ID</Label>
                      <Input
                        id="shadowCustomerId"
                        value={externalCustomerId}
                        onChange={(e) => setExternalCustomerId(e.target.value)}
                        placeholder="customer_456"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shadowName">Customer Name (Optional)</Label>
                      <Input
                        id="shadowName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shadowEmail">Customer Email (Optional)</Label>
                      <Input
                        id="shadowEmail"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={createShadowCustomer} className="w-full">Create Shadow Customer</Button>
                
                {claimCode && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Shadow Account Created!</h4>
                    <p className="text-sm text-green-700 mb-2">
                      The customer can now earn points without having the app. Share the claim code with them to activate later:
                    </p>
                    <div className="bg-white p-3 rounded flex items-center justify-between">
                      <code className="font-mono text-sm">{claimCode}</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(claimCode);
                          toast({
                            title: 'Claim Code Copied',
                            description: 'The claim code has been copied to your clipboard'
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activate Shadow Account</CardTitle>
                <CardDescription>Activate a shadow account by claiming accumulated points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimCode">Claim Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="claimCode"
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value)}
                        placeholder="ABCD-1234-EFGH-5678"
                        className="flex-1"
                      />
                      <Button onClick={validateClaimCode} variant="outline">Validate</Button>
                    </div>
                  </div>
                  
                  {shadowAccountInfo && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Valid Claim Code!</h4>
                      <p className="text-sm text-blue-700">
                        {shadowAccountInfo.points} points available from {shadowAccountInfo.partnerName}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="walletPublicKey">Wallet Public Key</Label>
                    <Input
                      id="walletPublicKey"
                      value={walletPublicKey}
                      onChange={(e) => setWalletPublicKey(e.target.value)}
                      placeholder="Enter your Solana wallet public key"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activationEmail">Email (Optional)</Label>
                    <Input
                      id="activationEmail"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={activateShadowAccount} 
                  className="w-full"
                  disabled={!shadowAccountInfo}
                >
                  Activate & Claim Points
                </Button>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Manage Shadow Accounts</CardTitle>
                <CardDescription>View and manage shadow accounts for a partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="partnerShadowId">Partner ID</Label>
                    <Input
                      id="partnerShadowId"
                      value={shadowPartnerId}
                      onChange={(e) => setShadowPartnerId(e.target.value)}
                      placeholder="partner_123"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={getShadowAccounts}>View Shadow Accounts</Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Shadow accounts data will be displayed in the developer console for now.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>QR Codes & Deep Links</CardTitle>
              <CardDescription>View generated QR code and deep link for customer onboarding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="universalId">Universal ID</Label>
                <Input
                  id="universalId"
                  value={universalId}
                  onChange={(e) => setUniversalId(e.target.value)}
                  placeholder="univ_abc123"
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label>QR Code</Label>
                  {qrCode ? (
                    <div className="border rounded-lg p-4 flex items-center justify-center" 
                      dangerouslySetInnerHTML={{ __html: qrCode }} />
                  ) : (
                    <div className="border rounded-lg p-12 flex items-center justify-center text-gray-400">
                      No QR code generated yet
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Deep Link</Label>
                  {deepLink ? (
                    <div className="border rounded-lg p-4 h-full flex flex-col">
                      <div className="flex-1 flex items-center justify-center">
                        <code className="bg-gray-100 p-2 rounded text-sm break-all">
                          {deepLink}
                        </code>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          navigator.clipboard.writeText(deepLink);
                          toast({
                            title: 'Deep Link Copied',
                            description: 'The deep link URL has been copied to your clipboard'
                          });
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-12 flex items-center justify-center text-gray-400">
                      No deep link generated yet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>SDK Documentation</CardTitle>
              <CardDescription>Learn how to integrate the Gami Protocol E-commerce SDK</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Installation</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>npm install @gami-protocol/sdk</code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Basic Usage</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`import { EcommerceIntegration, TransactionType } from '@gami-protocol/sdk';

// Initialize the SDK
const sdk = new EcommerceIntegration('your-api-key');

// Register a partner business
const partner = await sdk.registerPartner({
  partnerName: 'My E-commerce Store',
  deepLinkUrl: 'myapp://open'
});

// Onboard a customer
const customer = await sdk.onboardCustomer({
  partnerId: partner.partnerId,
  externalCustomerId: 'customer_123',
  name: 'John Doe',
  email: 'john@example.com'
});

// Award points
const awardResult = await sdk.awardPoints({
  partnerId: partner.partnerId,
  externalCustomerId: 'customer_123',
  points: 100
});

// Create a shadow customer (for users without the app)
const shadowCustomer = await sdk.createShadowCustomer({
  partnerId: partner.partnerId,
  externalCustomerId: 'shadow_customer_456',
  name: 'Jane Smith',
  email: 'jane@example.com'
});

// Award points to a shadow account
const shadowAwardResult = await sdk.awardPoints({
  partnerId: partner.partnerId,
  externalCustomerId: 'shadow_customer_456',
  points: 75,
  transactionType: TransactionType.SHADOW_AWARD
});

// Redeem points
const redeemResult = await sdk.redeemPoints({
  partnerId: partner.partnerId,
  externalCustomerId: 'customer_123',
  points: 50,
  purpose: 'Store discount'
});

// Check balance
const balance = await sdk.getCustomerBalance(
  'customer_123',
  partner.partnerId
);

// Check if customer exists
const exists = await sdk.customerExists(
  'customer_123',
  partner.partnerId
);`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Available Methods</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">registerPartner(data)</h4>
                    <p className="text-sm text-gray-600">Register a new partner business to the Gami Protocol.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">onboardCustomer(data)</h4>
                    <p className="text-sm text-gray-600">Onboard a customer to the universal system with QR code and deep link.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">generateQRCode(universalId, format)</h4>
                    <p className="text-sm text-gray-600">Generate a QR code for a customer.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">generateDeepLink(universalId)</h4>
                    <p className="text-sm text-gray-600">Generate a deep link for mobile app onboarding.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">awardPoints(data)</h4>
                    <p className="text-sm text-gray-600">Award points to a customer.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">redeemPoints(data)</h4>
                    <p className="text-sm text-gray-600">Redeem points from a customer's balance.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">getCustomerBalance(externalCustomerId, partnerId)</h4>
                    <p className="text-sm text-gray-600">Get a customer's points balance.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">customerExists(externalCustomerId, partnerId)</h4>
                    <p className="text-sm text-gray-600">Check if a customer exists in the universal system.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">createShadowCustomer(data)</h4>
                    <p className="text-sm text-gray-600">Create a shadow account for customers who don't have the mobile app yet.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">validateClaimCode(claimCode)</h4>
                    <p className="text-sm text-gray-600">Validate a claim code and get information about the associated shadow account.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">activateShadowAccount(data)</h4>
                    <p className="text-sm text-gray-600">Activate a shadow account and migrate accumulated points to a real account.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">getPartnerShadowAccounts(partnerId)</h4>
                    <p className="text-sm text-gray-600">Get all shadow accounts for a partner business.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Shadow Account Example</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`// Create a shadow customer (without wallet)
const shadowCustomer = await sdk.createShadowCustomer({
  partnerId: 'partner_123',
  externalCustomerId: 'customer_456',
  name: 'Jane Smith',
  email: 'jane@example.com'
});

// Share the claim code with the customer
const claimCode = shadowCustomer.claimCode;

// Award points to shadow account
const awardResult = await sdk.awardPoints({
  partnerId: 'partner_123',
  externalCustomerId: 'customer_456',
  points: 100,
  transactionType: TransactionType.SHADOW_AWARD
});

// Later, when the customer downloads the app:
// Validate a claim code
const claimInfo = await sdk.validateClaimCode('ABCD-1234-EFGH-5678');

// Activate the shadow account with wallet
const activationResult = await sdk.activateShadowAccount({
  claimCode: 'ABCD-1234-EFGH-5678',
  walletPublicKey: '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xKYP6PhvYe9hqT',
  email: 'jane@example.com'
});`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
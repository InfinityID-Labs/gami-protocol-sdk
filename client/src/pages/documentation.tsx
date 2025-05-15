import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ExternalLink, Copy, Check } from "lucide-react";
import { FaCopy, FaCheck } from "react-icons/fa";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Documentation() {
  const [activeTab, setActiveTab] = useState("getting-started");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSnippet(snippetId);
      setTimeout(() => setCopiedSnippet(null), 2000);
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Documentation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Learn how to integrate and use the Gami Protocol SDK
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <a href="#getting-started" onClick={() => setActiveTab("getting-started")} className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    activeTab === "getting-started" ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  )}>
                    Getting Started
                  </a>
                  <a href="#installation" onClick={() => setActiveTab("installation")} className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    activeTab === "installation" ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  )}>
                    Installation
                  </a>
                  <a href="#xp-tracking" onClick={() => setActiveTab("xp-tracking")} className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    activeTab === "xp-tracking" ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  )}>
                    XP Tracking
                  </a>
                  <a href="#wallet-integration" onClick={() => setActiveTab("wallet-integration")} className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    activeTab === "wallet-integration" ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  )}>
                    Wallet Integration
                  </a>
                  <a href="#campaigns" onClick={() => setActiveTab("campaigns")} className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    activeTab === "campaigns" ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  )}>
                    Campaigns
                  </a>
                  <a href="#rewards" onClick={() => setActiveTab("rewards")} className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    activeTab === "rewards" ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  )}>
                    Rewards
                  </a>
                  <a href="#api-reference" onClick={() => setActiveTab("api-reference")} className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    activeTab === "api-reference" ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  )}>
                    API Reference
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card id="getting-started" className={activeTab === "getting-started" ? "" : "hidden"}>
              <CardHeader>
                <CardTitle>Getting Started with Gami Protocol</CardTitle>
                <CardDescription>
                  Welcome to the Gami Protocol documentation. Learn how to integrate gamification into your application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">What is Gami Protocol?</h3>
                  <p className="text-slate-600">
                    Gami Protocol is a comprehensive gamification platform that allows developers to add experience points (XP), 
                    rewards, and blockchain-based incentives to their applications. It combines traditional engagement 
                    mechanics with Web3 technology to create powerful user experiences.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Key Features</h3>
                  <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li>XP tracking and management system</li>
                    <li>Integration with Solana blockchain for token rewards</li>
                    <li>Wallet connections (Phantom, Solflare)</li>
                    <li>Campaign creation and management</li>
                    <li>Real-time analytics and reporting</li>
                    <li>Customizable reward distribution</li>
                  </ul>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Getting Help</AlertTitle>
                  <AlertDescription>
                    If you need assistance, join our <a href="https://discord.gg/gamiprotocol" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Discord community</a> or 
                    contact <a href="mailto:support@gamiprotocol.com" className="text-primary-500 hover:underline">support@gamiprotocol.com</a>.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
                  <p className="text-slate-600 mb-2">
                    Before you begin, ensure you have the following:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li>Node.js (v14 or higher)</li>
                    <li>npm or yarn package manager</li>
                    <li>React.js application (v16.8+ recommended)</li>
                    <li>Gami Protocol API key (obtain from your dashboard)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Quick Start</h3>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`# Install the SDK
npm install @gami-protocol/sdk

# Initialize in your application
import { GamiSDK } from '@gami-protocol/sdk';

const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key',
  environment: 'development'
});

# Track an event
gamiSDK.trackEvent({
  userId: 'user-123',
  event: 'complete_tutorial',
  metadata: { timeSpent: 300 }
});`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`# Install the SDK
npm install @gami-protocol/sdk

# Initialize in your application
import { GamiSDK } from '@gami-protocol/sdk';

const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key',
  environment: 'development'
});

# Track an event
gamiSDK.trackEvent({
  userId: 'user-123',
  event: 'complete_tutorial',
  metadata: { timeSpent: 300 }
});`, "quick-start")}
                  >
                    {copiedSnippet === "quick-start" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card id="installation" className={activeTab === "installation" ? "" : "hidden"}>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>
                  How to install and set up the Gami Protocol SDK in your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">SDK Installation</h3>
                  <p className="text-slate-600 mb-4">
                    Install the Gami Protocol SDK using npm or yarn:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm">
                    <pre>{`npm install @gami-protocol/sdk`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard("npm install @gami-protocol/sdk", "install-npm")}
                  >
                    {copiedSnippet === "install-npm" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>

                  <div className="mt-4 bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm">
                    <pre>{`yarn add @gami-protocol/sdk`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard("yarn add @gami-protocol/sdk", "install-yarn")}
                  >
                    {copiedSnippet === "install-yarn" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Initializing the SDK</h3>
                  <p className="text-slate-600 mb-4">
                    Import and initialize the Gami SDK in your application:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`import { GamiSDK } from '@gami-protocol/sdk';

// Initialize the SDK with your project API key
const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key-here',
  projectId: 'your-project-id',
  environment: 'production' // or 'development'
});`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`import { GamiSDK } from '@gami-protocol/sdk';

// Initialize the SDK with your project API key
const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key-here',
  projectId: 'your-project-id',
  environment: 'production' // or 'development'
});`, "init-sdk")}
                  >
                    {copiedSnippet === "init-sdk" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Configuration Options</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Option</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Required</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">apiKey</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Your Gami Protocol API key</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">projectId</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Your project identifier</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">environment</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">'development' or 'production'</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">apiUrl</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Custom API URL (if needed)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>API Key Security</AlertTitle>
                  <AlertDescription>
                    Keep your API keys secure and never expose them in client-side code. Use environment variables and server-side proxies for production applications.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card id="xp-tracking" className={activeTab === "xp-tracking" ? "" : "hidden"}>
              <CardHeader>
                <CardTitle>XP Tracking</CardTitle>
                <CardDescription>
                  Learn how to track user actions and award XP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Tracking Events</h3>
                  <p className="text-slate-600 mb-4">
                    Use the trackEvent method to award XP for user actions:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Track user actions to award XP
gamiSDK.trackEvent({
  userId: 'user-123',
  event: 'complete_lesson',
  metadata: {
    lessonId: 'lesson-456',
    timeSpent: 300, // seconds
    pointsEarned: 50
  }
});`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Track user actions to award XP
gamiSDK.trackEvent({
  userId: 'user-123',
  event: 'complete_lesson',
  metadata: {
    lessonId: 'lesson-456',
    timeSpent: 300, // seconds
    pointsEarned: 50
  }
});`, "track-event")}
                  >
                    {copiedSnippet === "track-event" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Event Parameters</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parameter</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Required</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">userId</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">User identifier in your system</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">event</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Event name (must match configured events)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">metadata</td>
                          <td className="px-4 py-3 text-sm text-slate-600">object</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Additional data about the event</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Automatic Event Tracking</h3>
                  <p className="text-slate-600 mb-4">
                    You can also automatically track events by adding event listeners to DOM elements:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Add event tracker to a button
const completeButton = document.getElementById('complete-button');

gamiSDK.addEventTracker(
  completeButton,
  'click',
  'complete_lesson',
  'user-123',
  (event) => ({
    lessonId: 'lesson-456',
    timeSpent: getLessonTime() // your function to get time spent
  })
);`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Add event tracker to a button
const completeButton = document.getElementById('complete-button');

gamiSDK.addEventTracker(
  completeButton,
  'click',
  'complete_lesson',
  'user-123',
  (event) => ({
    lessonId: 'lesson-456',
    timeSpent: getLessonTime() // your function to get time spent
  })
);`, "auto-track")}
                  >
                    {copiedSnippet === "auto-track" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                  <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li>Use consistent event names across your application</li>
                    <li>Include relevant metadata to provide context</li>
                    <li>Track events at appropriate points in the user journey</li>
                    <li>Test events in the development environment before deploying</li>
                    <li>Consider batching events for better performance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card id="wallet-integration" className={activeTab === "wallet-integration" ? "" : "hidden"}>
              <CardHeader>
                <CardTitle>Wallet Integration</CardTitle>
                <CardDescription>
                  Connect to Solana wallets for token rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Connecting Wallets</h3>
                  <p className="text-slate-600 mb-4">
                    Connect to a user's Solana wallet to enable token rewards:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Connect with Solana wallet
await gamiSDK.connectWallet({
  walletType: 'phantom', // or 'solflare'
  onSuccess: (publicKey) => {
    console.log('Connected wallet:', publicKey);
    // Store wallet address or update UI
  },
  onError: (error) => {
    console.error('Wallet connection error:', error);
    // Handle connection error
  }
});`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Connect with Solana wallet
await gamiSDK.connectWallet({
  walletType: 'phantom', // or 'solflare'
  onSuccess: (publicKey) => {
    console.log('Connected wallet:', publicKey);
    // Store wallet address or update UI
  },
  onError: (error) => {
    console.error('Wallet connection error:', error);
    // Handle connection error
  }
});`, "connect-wallet")}
                  >
                    {copiedSnippet === "connect-wallet" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Supported Wallets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg viewBox="0 0 128 128" className="h-8 w-8">
                          <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64c11.2 0 21.7-2.9 30.8-7.9L48.4 55.3v36.6h-6.8V41.8h6.8l50.5 75.8C116.4 106.2 128 86.5 128 64c0-35.3-28.7-64-64-64zm22.1 84.6l-7.5-11.3V41.8h7.5v42.8z" fill="#AB9FF2"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Phantom</h4>
                        <p className="text-sm text-slate-500">Popular Solana wallet with browser extension and mobile app</p>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg viewBox="0 0 96 96" className="h-8 w-8">
                          <path d="M95.5053 50.8438L83.5199 36.0275C79.6823 31.1975 73.3212 29.2475 67.7695 30.305L42.9363 35.4375C36.9943 36.5538 32.297 41.2513 31.1808 47.1938L26.0482 71.8863C24.9912 77.44 26.9404 83.8 31.7704 87.6375L46.5867 99.6237C52.7508 104.405 61.5348 104.308 67.6019 99.405L91.7236 79.0075C97.3723 74.495 99.193 66.5388 96.6217 59.735L95.5053 50.8438Z" fill="#F99D25"/>
                          <path d="M33.2002 15.84L46.8202 4.79999C52.4202 0.129995 60.5402 0.129995 66.1402 4.79999L76.4402 13.6C80.8802 17.44 81.7602 24.04 78.3602 28.84L43.1002 71.6C39.1802 76.4 32.2202 77.4 27.2602 73.88L11.6402 63.4C5.72023 59.76 4.32023 51.8 8.56023 46.48L33.2002 15.84Z" fill="#FED700"/>
                          <path d="M53.96 38.16C59.012 38.16 63.12 34.052 63.12 29C63.12 23.948 59.012 19.84 53.96 19.84C48.908 19.84 44.8 23.948 44.8 29C44.8 34.052 48.908 38.16 53.96 38.16Z" fill="#FFAD32"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Solflare</h4>
                        <p className="text-sm text-slate-500">Non-custodial wallet for the Solana blockchain</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Wallet Detection</AlertTitle>
                  <AlertDescription>
                    The SDK automatically checks if the selected wallet is installed. If not, it will prompt users to install the appropriate wallet extension.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Disconnecting a Wallet</h3>
                  <p className="text-slate-600 mb-4">
                    You can disconnect a wallet using the <code>disconnectWallet</code> method:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Disconnect a wallet using its public key
const success = await gamiSDK.disconnectWallet(publicKey);

if (success) {
  console.log('Wallet disconnected successfully');
  // Update your UI or state
} else {
  console.error('Failed to disconnect wallet');
}`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Disconnect a wallet using its public key
const success = await gamiSDK.disconnectWallet(publicKey);

if (success) {
  console.log('Wallet disconnected successfully');
  // Update your UI or state
} else {
  console.error('Failed to disconnect wallet');
}`, "disconnect-wallet")}
                  >
                    {copiedSnippet === "disconnect-wallet" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Getting Token Balances</h3>
                  <p className="text-slate-600 mb-4">
                    Once a wallet is connected, you can retrieve token balances:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Get token balances for a connected wallet
const result = await gamiSDK.getTokenBalances(publicKey);

if (result.success) {
  const balances = result.balances;
  console.log('Token balances:', balances);
  
  // Example of displaying balances
  balances.forEach(token => {
    console.log(\`\${token.token}: \${token.amount} (\$\${token.usdValue})\`);
  });
} else {
  console.error('Failed to get balances:', result.error);
}`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Get token balances for a connected wallet
const result = await gamiSDK.getTokenBalances(publicKey);

if (result.success) {
  const balances = result.balances;
  console.log('Token balances:', balances);
  
  // Example of displaying balances
  balances.forEach(token => {
    console.log(\`\${token.token}: \${token.amount} (\$\${token.usdValue})\`);
  });
} else {
  console.error('Failed to get balances:', result.error);
}`, "get-balances")}
                  >
                    {copiedSnippet === "get-balances" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Sending Transactions</h3>
                  <p className="text-slate-600 mb-4">
                    Send tokens from a connected wallet:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Send tokens from a connected wallet
const result = await gamiSDK.sendTransaction(publicKey, {
  to: 'recipient-wallet-address',
  amount: 10.5,
  token: 'GAMI', // or 'SOL' for native Solana tokens
  memo: 'Optional transaction memo',
  onSuccess: (txHash) => {
    console.log('Transaction successful:', txHash);
    // Show success message to user
  },
  onError: (error) => {
    console.error('Transaction failed:', error);
    // Show error message to user
  }
});

if (result.success) {
  console.log('Transaction initiated:', result.txHash);
} else {
  console.error('Failed to initiate transaction:', result.error);
}`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Send tokens from a connected wallet
const result = await gamiSDK.sendTransaction(publicKey, {
  to: 'recipient-wallet-address',
  amount: 10.5,
  token: 'GAMI', // or 'SOL' for native Solana tokens
  memo: 'Optional transaction memo',
  onSuccess: (txHash) => {
    console.log('Transaction successful:', txHash);
    // Show success message to user
  },
  onError: (error) => {
    console.error('Transaction failed:', error);
    // Show error message to user
  }
});

if (result.success) {
  console.log('Transaction initiated:', result.txHash);
} else {
  console.error('Failed to initiate transaction:', result.error);
}`, "send-transaction")}
                  >
                    {copiedSnippet === "send-transaction" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Creating a Wallet Connect Button</h3>
                  <p className="text-slate-600 mb-4">
                    Here's how to create a wallet connection button in a React app:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`import React, { useState } from 'react';
import { GamiSDK } from '@gami-protocol/sdk';

// Initialize the SDK
const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key-here',
  environment: 'production'
});

function WalletConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const result = await gamiSDK.connectWallet({
        walletType: 'phantom',
        onSuccess: (publicKey) => {
          setWalletAddress(publicKey);
        },
        onError: (error) => {
          console.error('Connection error:', error);
        }
      });
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      {isConnecting 
        ? 'Connecting...' 
        : walletAddress 
          ? \`Connected: \${walletAddress.slice(0, 6)}...\${walletAddress.slice(-4)}\` 
          : 'Connect Wallet'
      }
    </button>
  );
}

export default WalletConnectButton;`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`import React, { useState } from 'react';
import { GamiSDK } from '@gami-protocol/sdk';

// Initialize the SDK
const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key-here',
  environment: 'production'
});

function WalletConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const result = await gamiSDK.connectWallet({
        walletType: 'phantom',
        onSuccess: (publicKey) => {
          setWalletAddress(publicKey);
        },
        onError: (error) => {
          console.error('Connection error:', error);
        }
      });
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      {isConnecting 
        ? 'Connecting...' 
        : walletAddress 
          ? \`Connected: \${walletAddress.slice(0, 6)}...\${walletAddress.slice(-4)}\` 
          : 'Connect Wallet'
      }
    </button>
  );
}

export default WalletConnectButton;`, "wallet-button")}
                  >
                    {copiedSnippet === "wallet-button" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card id="campaigns" className={activeTab === "campaigns" ? "" : "hidden"}>
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>
                  Understanding and implementing gamification campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">What are Campaigns?</h3>
                  <p className="text-slate-600">
                    Campaigns are time-bound gamification initiatives with specific objectives and rewards. They help drive 
                    engagement and incentivize desired user behaviors. Campaigns can be created and managed through the 
                    Gami Protocol dashboard.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Campaign Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">Milestone Campaigns</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Reward users for reaching specific milestones or accomplishing defined objectives.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">Time-Limited Challenges</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Set challenges with a specific timeframe to create urgency and drive engagement.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">Leaderboard Competitions</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Encourage competition by ranking users based on XP or achievements.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">Seasonal Events</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Periodic campaigns tied to seasons, holidays, or special events.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Implementing Campaigns</h3>
                  <p className="text-slate-600 mb-4">
                    To implement campaigns in your application:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-slate-600">
                    <li>
                      <span className="font-medium">Create a campaign</span> in the Gami Protocol dashboard with defined objectives and rewards
                    </li>
                    <li>
                      <span className="font-medium">Track relevant events</span> using the SDK's trackEvent method
                    </li>
                    <li>
                      <span className="font-medium">Display campaign progress</span> to users using the campaign data API
                    </li>
                    <li>
                      <span className="font-medium">Notify users</span> when they earn rewards or complete campaign objectives
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Fetching Campaign Data</h3>
                  <p className="text-slate-600 mb-4">
                    Retrieve campaign information to display in your application:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Get active campaigns
const getCampaigns = async (userId) => {
  const response = await fetch('/api/campaigns', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    }
  });
  
  return response.json();
};

// Get user progress in a campaign
const getUserCampaignProgress = async (userId, campaignId) => {
  const response = await fetch(\`/api/campaigns/\${campaignId}/progress/\${userId}\`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    }
  });
  
  return response.json();
};`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Get active campaigns
const getCampaigns = async (userId) => {
  const response = await fetch('/api/campaigns', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    }
  });
  
  return response.json();
};

// Get user progress in a campaign
const getUserCampaignProgress = async (userId, campaignId) => {
  const response = await fetch(\`/api/campaigns/\${campaignId}/progress/\${userId}\`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    }
  });
  
  return response.json();
};`, "campaign-data")}
                  >
                    {copiedSnippet === "campaign-data" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Best Practices</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>Keep campaigns focused on specific objectives</li>
                      <li>Set achievable goals with meaningful rewards</li>
                      <li>Communicate campaign rules and timelines clearly</li>
                      <li>Provide real-time feedback on progress</li>
                      <li>Balance competition with collaboration</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card id="rewards" className={activeTab === "rewards" ? "" : "hidden"}>
              <CardHeader>
                <CardTitle>Rewards</CardTitle>
                <CardDescription>
                  Implementing and managing token rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Token Rewards</h3>
                  <p className="text-slate-600">
                    Gami Protocol allows you to reward users with $GAMI tokens on the Solana blockchain. These tokens can be 
                    used for various purposes within your application ecosystem, including access to premium features, 
                    in-app purchases, or exchanged for other cryptocurrencies.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Reward Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">XP-Based Rewards</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Tokens awarded based on XP milestones or accumulated experience points.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">Achievement Rewards</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        One-time rewards for completing specific objectives or achievements.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">Campaign Rewards</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Tokens distributed at the end of a campaign based on participation and performance.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary-600">Referral Rewards</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Tokens awarded for referring new users to the platform.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Claiming Rewards</h3>
                  <p className="text-slate-600 mb-4">
                    Users can claim their rewards through your application if they have connected a wallet:
                  </p>
                  <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Check available rewards
const checkRewards = async (userId) => {
  const response = await fetch(\`/api/rewards/available/\${userId}\`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    }
  });
  
  return response.json();
};

// Claim rewards
const claimRewards = async (userId, walletAddress) => {
  const response = await fetch('/api/rewards/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      userId,
      walletAddress
    })
  });
  
  return response.json();
};`}</pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-primary-500 hover:text-primary-600"
                    onClick={() => copyToClipboard(`// Check available rewards
const checkRewards = async (userId) => {
  const response = await fetch(\`/api/rewards/available/\${userId}\`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    }
  });
  
  return response.json();
};

// Claim rewards
const claimRewards = async (userId, walletAddress) => {
  const response = await fetch('/api/rewards/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      userId,
      walletAddress
    })
  });
  
  return response.json();
};`, "claim-rewards")}
                  >
                    {copiedSnippet === "claim-rewards" ? (
                      <>
                        <FaCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Reward Distribution Process</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-slate-600">
                    <li>
                      <span className="font-medium">Earning rewards:</span> Users earn rewards by completing actions that trigger XP events or by reaching campaign milestones
                    </li>
                    <li>
                      <span className="font-medium">Connecting wallet:</span> Users must connect their Solana wallet to receive token rewards
                    </li>
                    <li>
                      <span className="font-medium">Claiming rewards:</span> Through your UI, users can claim available rewards, which initiates a token transfer
                    </li>
                    <li>
                      <span className="font-medium">Transaction confirmation:</span> The reward distribution is confirmed on the Solana blockchain
                    </li>
                    <li>
                      <span className="font-medium">Token management:</span> Users can view and manage their GAMI tokens in their connected wallet
                    </li>
                  </ol>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <InfoIcon className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-800">Important Note on Gas Fees</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Gami Protocol covers all gas fees for token transfers on the Solana blockchain. Users do not need to worry about having SOL in their wallets to receive rewards.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="text-lg font-medium mb-2">Reward Design Best Practices</h3>
                  <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li>Balance intrinsic and extrinsic motivations when designing reward mechanisms</li>
                    <li>Create a clear correlation between user effort and reward value</li>
                    <li>Implement tiered reward structures to cater to different user segments</li>
                    <li>Combine immediate rewards with long-term incentives</li>
                    <li>Consider token economics carefully to maintain a sustainable reward ecosystem</li>
                    <li>Provide clear information about when and how rewards can be claimed</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card id="api-reference" className={activeTab === "api-reference" ? "" : "hidden"}>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>
                  Complete SDK API documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">GamiSDK</h3>
                  <p className="text-slate-600 mb-4">
                    The main SDK class providing access to all functionality.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parameters</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Return Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">constructor</td>
                          <td className="px-4 py-3 text-sm text-slate-600">GamiSDKConfig</td>
                          <td className="px-4 py-3 text-sm text-slate-600">GamiSDK</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Initializes the SDK with configuration</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">trackEvent</td>
                          <td className="px-4 py-3 text-sm text-slate-600">TrackEventParams</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Promise&lt;TrackEventResponse&gt;</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Tracks a user action to award XP</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">addEventTracker</td>
                          <td className="px-4 py-3 text-sm text-slate-600">element, eventType, gamiEvent, userId, metadataFn?</td>
                          <td className="px-4 py-3 text-sm text-slate-600">void</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Adds an event listener to track user actions</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">connectWallet</td>
                          <td className="px-4 py-3 text-sm text-slate-600">ConnectWalletParams</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Promise&lt;ConnectWalletResponse&gt;</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Connects to a Solana wallet</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">disconnectWallet</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string (publicKey)</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Promise&lt;boolean&gt;</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Disconnects a previously connected wallet</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">getTokenBalances</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string (publicKey)</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Promise&lt;TokenBalanceResponse&gt;</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Retrieves token balances for a connected wallet</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">sendTransaction</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string, TransactionParams</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Promise&lt;TransactionResponse&gt;</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Sends a token transaction from a connected wallet</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">TrackEventParams</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Property</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Required</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">userId</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">User identifier in your system</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">event</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Event name (must match configured events)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">metadata</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Record&lt;string, any&gt;</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Additional event data</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">ConnectWalletParams</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Property</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Required</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">walletType</td>
                          <td className="px-4 py-3 text-sm text-slate-600">WalletType ('phantom' | 'solflare' | 'walletconnect')</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Type of wallet to connect</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">onSuccess</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Function callback</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Success callback with public key</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">onError</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Function callback</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Error callback</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">TransactionParams</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Property</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Required</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">to</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Recipient wallet address</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">amount</td>
                          <td className="px-4 py-3 text-sm text-slate-600">number</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Yes</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Amount of tokens to send</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">token</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Token symbol (default: 'SOL')</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">memo</td>
                          <td className="px-4 py-3 text-sm text-slate-600">string</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Optional transaction memo</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">onSuccess</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Function callback</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Success callback with transaction hash</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">onError</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Function callback</td>
                          <td className="px-4 py-3 text-sm text-slate-600">No</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Error callback</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">TokenBalanceResponse</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Property</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">success</td>
                          <td className="px-4 py-3 text-sm text-slate-600">boolean</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Whether the balance request was successful</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">balances</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Array of token balance objects</td>
                          <td className="px-4 py-3 text-sm text-slate-600">List of token balances (only present if success is true)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">error</td>
                          <td className="px-4 py-3 text-sm text-slate-600">GamiError object</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Error details (only present if success is false)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">REST API Endpoints</h3>
                  <p className="text-slate-600 mb-4">
                    The Gami Protocol also provides RESTful API endpoints that can be called directly:
                  </p>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md mr-2">POST</span>
                        <code className="text-sm font-mono">/api/track</code>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Track a user event to award XP. Requires X-API-Key header and JSON body with userId, event, and optional metadata.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md mr-2">POST</span>
                        <code className="text-sm font-mono">/api/connect-wallet</code>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Verify wallet connection. Requires X-API-Key header and JSON body with walletType.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md mr-2">POST</span>
                        <code className="text-sm font-mono">/api/wallet/balances</code>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Get token balances for a wallet. Requires X-API-Key header and JSON body with publicKey and chainType.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md mr-2">POST</span>
                        <code className="text-sm font-mono">/api/transaction</code>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Create a transaction. Requires X-API-Key header and JSON body with fromPublicKey, toAddress, amount, chainType, and token.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md mr-2">POST</span>
                        <code className="text-sm font-mono">/api/solana/transaction</code>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Create a Solana-specific transaction. Requires X-API-Key header and JSON body with fromPublicKey, toAddress, amount, and token.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md mr-2">GET</span>
                        <code className="text-sm font-mono">/api/admin/stats</code>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Get project statistics. Requires X-API-Key header.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md mr-2">GET</span>
                        <code className="text-sm font-mono">/api/admin/events</code>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Get XP events data. Requires X-API-Key header.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-lg border border-slate-200 p-4 bg-slate-50">
                  <div>
                    <h3 className="font-medium">Full API Documentation</h3>
                    <p className="text-sm text-slate-600">
                      Access the complete API reference with detailed examples and specifications.
                    </p>
                  </div>
                  <Button>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    API Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

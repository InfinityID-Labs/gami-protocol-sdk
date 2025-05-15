import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

interface CodeSnippet {
  title: string;
  description: string;
  code: string;
}

interface SDKIntegrationProps {
  sdkVersion?: string;
  apiKey?: string;
}

export default function SDKIntegration({ sdkVersion = "1.2.4", apiKey = "your-api-key-here" }: SDKIntegrationProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const codeSnippets: CodeSnippet[] = [
    {
      title: "1. Install the package",
      description: "Install the Gami Protocol SDK package using npm:",
      code: "npm install @gami-protocol/sdk"
    },
    {
      title: "2. Initialize SDK in your React app",
      description: "Import and initialize the SDK with your project API key:",
      code: `import { GamiSDK } from '@gami-protocol/sdk';

// Initialize the SDK with your project API key
const gamiSDK = new GamiSDK({
  apiKey: '${apiKey}',
  projectId: 'your-project-id',
  environment: 'production' // or 'development'
});`
    },
    {
      title: "3. Track XP events",
      description: "Track user actions to award XP points:",
      code: `// Track user actions to award XP
gamiSDK.trackEvent({
  userId: 'user-123',
  event: 'complete_lesson',
  metadata: {
    lessonId: 'lesson-456',
    timeSpent: 300, // seconds
    pointsEarned: 50
  }
});`
    },
    {
      title: "4. Wallet Integration",
      description: "Connect with Solana wallets like Phantom or Solflare:",
      code: `// Connect with Solana wallet
await gamiSDK.connectWallet({
  walletType: 'phantom', // or 'solflare'
  onSuccess: (publicKey) => {
    console.log('Connected wallet:', publicKey);
  },
  onError: (error) => {
    console.error('Wallet connection error:', error);
  }
});`
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">SDK Integration</h3>
        <Button variant="link" className="text-primary-500 hover:text-primary-600 font-medium text-sm p-0">
          View Documentation
        </Button>
      </div>
      <div className="p-5">
        <p className="text-slate-600 mb-4">Integrate the Gami Protocol SDK into your React application:</p>
        
        {codeSnippets.map((snippet, index) => (
          <div key={index} className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">{snippet.title}</h4>
            <div className="bg-slate-800 text-slate-100 rounded-md p-3 mb-2 font-mono text-sm overflow-x-auto">
              <pre><code>{snippet.code}</code></pre>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 p-0"
              onClick={() => copyToClipboard(snippet.code, index)}
            >
              {copiedIndex === index ? (
                <>
                  <FaCheck className="mr-1" size={12} />
                  Copied!
                </>
              ) : (
                <>
                  <FaCopy className="mr-1" size={12} />
                  Copy
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 px-5 py-4 flex justify-between items-center">
        <span className="text-sm text-slate-500">Current SDK Version: <span className="font-medium text-slate-700">{sdkVersion}</span></span>
        <Button size="sm" className="text-sm bg-primary-500 hover:bg-primary-600 text-white">
          Get API Keys
        </Button>
      </div>
    </Card>
  );
}

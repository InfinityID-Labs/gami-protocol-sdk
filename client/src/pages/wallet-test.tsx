import WalletConnectionTest from "@/components/test/WalletConnectionTest";
import Layout from "@/components/Layout";

export default function WalletTestPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Wallet Connection Testing</h2>
        <p className="text-center mb-8 text-slate-600">
          This page allows you to test the wallet connection functionality directly.
        </p>
        
        <WalletConnectionTest />
      </div>
    </Layout>
  );
}
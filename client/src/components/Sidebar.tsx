import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FaHome, FaCode, FaTrophy, FaWallet, FaRocket, FaChartBar, FaCog, FaBook, FaShoppingCart } from "react-icons/fa";

interface SidebarLink {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  className?: string;
}

const navLinks: SidebarLink[] = [
  { href: "/", icon: <FaHome className="w-5 h-5" />, label: "Dashboard" },
  { href: "/sdk-config", icon: <FaCode className="w-5 h-5" />, label: "SDK Configuration" },
  { href: "/xp-management", icon: <FaTrophy className="w-5 h-5" />, label: "XP Management" },
  { href: "/wallet-integration", icon: <FaWallet className="w-5 h-5" />, label: "Wallet Integration" },
  { href: "/ecommerce", icon: <FaShoppingCart className="w-5 h-5" />, label: "E-commerce" },
  { href: "/campaigns", icon: <FaRocket className="w-5 h-5" />, label: "Campaigns" },
  { href: "/analytics", icon: <FaChartBar className="w-5 h-5" />, label: "Analytics" },
  { href: "/settings", icon: <FaCog className="w-5 h-5" />, label: "Settings" },
  { href: "/documentation", icon: <FaBook className="w-5 h-5" />, label: "Documentation" },
];

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className={cn("bg-white shadow-md w-64 flex-shrink-0 hidden md:flex flex-col h-screen", className)}>
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
            G
          </div>
          <h1 className="ml-3 text-xl font-bold">Gami Protocol</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                  location === link.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <span className="w-6">{link.icon}</span>
                <span>{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-slate-300 flex items-center justify-center text-slate-600">
            U
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

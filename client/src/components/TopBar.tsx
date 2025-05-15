import { useState } from "react";
import { FaBars, FaBell, FaQuestionCircle, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Menu">
            <FaBars className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
              className="w-56 md:w-64 pl-10 pr-4 py-2 text-sm rounded-lg border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <FaBell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Help">
            <FaQuestionCircle className="h-5 w-5" />
          </Button>
          <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-2">
            <FaPlus className="h-3.5 w-3.5" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

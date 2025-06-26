import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  LogOut,
  Settings,
  FileText,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 h-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {user.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl"
      >
        {/* User Info Header */}
        <DropdownMenuLabel className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Account Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <User className="w-4 h-4 text-slate-500" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Document History</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Preferences</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-3 p-3 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;

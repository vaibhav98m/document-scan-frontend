import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "icon",
  variant = "outline",
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={toggleTheme}
            className={`transition-all duration-200 ${className}`}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <>
                <Moon className={`${showLabel ? "mr-2" : ""} h-4 w-4`} />
                {showLabel && <span>Dark Mode</span>}
              </>
            ) : (
              <>
                <Sun className={`${showLabel ? "mr-2" : ""} h-4 w-4`} />
                {showLabel && <span>Light Mode</span>}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

const ThemeDemo = () => {
  const { theme } = useTheme();

  return (
    <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Theme Showcase
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Currently using{" "}
            <Badge variant="outline" className="ml-1">
              {theme} mode
            </Badge>
          </p>
        </div>

        <Separator />

        {/* Theme Toggle Demo */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Theme Controls
          </h3>
          <div className="flex justify-center gap-4">
            <ThemeToggle showLabel size="default" />
            <ThemeToggle size="icon" variant="outline" />
            <ThemeToggle size="sm" variant="secondary" />
          </div>
        </div>

        <Separator />

        {/* Colors Demo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Color Palette
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Primary Button
              </Button>
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
              <Button variant="secondary" className="w-full">
                Secondary Button
              </Button>
            </div>
            <div className="space-y-2">
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
              <Badge variant="outline">Outline Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Alerts Demo */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Alert Components
          </h3>

          <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Success: Document uploaded successfully!
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Info: AI analysis in progress...
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Warning: Large file size detected.
            </AlertDescription>
          </Alert>
        </div>

        {/* Typography Demo */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Typography Scale
          </h3>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Heading 1 - Large Title
            </h1>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Heading 2 - Section Title
            </h2>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Heading 3 - Subsection
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Body text with proper contrast and readability in both light and
              dark themes.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Small text for captions and secondary information.
            </p>
          </div>
        </div>

        {/* Theme Status */}
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {theme === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span>Theme automatically syncs with your system preferences</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ThemeDemo;

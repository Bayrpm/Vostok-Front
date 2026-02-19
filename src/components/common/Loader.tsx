import { Loader2 } from "lucide-react";

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
}

export function Loader({
  size = "md",
  fullScreen = false,
  message,
}: LoaderProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">{loaderContent}</div>
  );
}

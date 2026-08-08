"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 24,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        size={size}
        className="animate-spin text-lime-400"
      />

      {text && (
        <p className="text-sm text-slate-400">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
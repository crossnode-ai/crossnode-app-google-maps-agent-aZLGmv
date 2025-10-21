// src/components/SubmitButton.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  isLoading: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function SubmitButton({
  isLoading,
  onClick,
  className,
  children,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out",
        className
      )}
      aria-busy={isLoading}
    >
      {isLoading ? "Submitting..." : children || "Submit"}
    </Button>
  );
}
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSaveJobAction } from "@/lib/actions/candidate-actions";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";

interface JobSaveButtonProps {
  jobId: string;
  initialIsSaved?: boolean;
  isLoggedIn?: boolean;
}

export function JobSaveButton({
  jobId,
  initialIsSaved = false,
  isLoggedIn = false,
}: JobSaveButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggleSave = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Optimistic state toggle
    const previousState = isSaved;
    setIsSaved(!previousState);

    startTransition(async () => {
      const result = await toggleSaveJobAction(jobId);
      if (!result.success) {
        // Rollback on server error
        setIsSaved(previousState);
        alert(result.error);
      } else if (result.data) {
        setIsSaved(result.data.isSaved);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggleSave}
      disabled={isPending}
      aria-label={isSaved ? "Remove from saved opportunities" : "Save opportunity"}
      className={`w-full text-xs h-9 font-medium transition-colors ${
        isSaved
          ? "border-brand-accent bg-brand-accent/10 text-brand-primary font-bold"
          : "border-border-strong text-text-secondary hover:text-brand-primary"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
      ) : (
        <Bookmark
          className={`h-3.5 w-3.5 mr-1 ${isSaved ? "fill-brand-accent text-brand-accent" : ""}`}
          aria-hidden="true"
        />
      )}
      <span>{isSaved ? "Saved" : "Save"}</span>
    </Button>
  );
}

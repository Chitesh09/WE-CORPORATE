"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface JobShareButtonProps {
  title: string;
  companyName: string;
}

export function JobShareButton({ title, companyName }: JobShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const shareData = {
      title: `${title} at ${companyName}`,
      text: `Check out this verified opportunity for ${title} at ${companyName} on WE CORPORATE.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard on dismissal or error
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      aria-label="Share this opportunity"
      className="w-full text-xs h-9 font-medium"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1 text-feedback-success-text" aria-hidden="true" />
          <span className="text-feedback-success-text font-semibold">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}

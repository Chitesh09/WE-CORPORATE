"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { askWeGuideAction } from "@/lib/actions/ai-actions";
import { ChatMessage } from "@/lib/ai/ai-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export function WeGuideWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, I'm WE Guide. I can help you navigate WE CORPORATE, understand application workflows, explore Career Services, and find platform features.",
    },
  ]);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isPending) return;

    setErrorMessage(null);
    setInputMessage("");

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text },
    ];
    setMessages(newMessages);

    startTransition(async () => {
      const result = await askWeGuideAction({
        message: text,
        history: newMessages.slice(-8),
        currentPath: pathname,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Sorry, I encountered an issue processing your question. Please try again or visit our Contact page.",
            ctaText: "Contact Support",
            ctaHref: "/contact",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: result.data.text,
            ctaText: result.data.ctaText,
            ctaHref: result.data.ctaHref,
          },
        ]);
      }
    });
  };

  const quickActionChips = [
    { label: "Find Jobs", query: "How do I search for jobs?" },
    { label: "Find Internships", query: "How do I search for internships?" },
    { label: "Track Applications", query: "Where can I see my applications?" },
    { label: "Career Services", query: "How do Career Services work?" },
    { label: "Resume Vault", query: "Where are my resumes stored?" },
    { label: "Contact Support", query: "How do I contact human support?" },
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40 print:hidden">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open WE Guide AI Assistant"
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-brand-primary text-white shadow-xl hover:bg-brand-secondary active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 border border-brand-accent/30"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-brand-accent animate-pulse" />
            </div>
            <span className="text-xs font-bold tracking-wide hidden sm:inline">
              Ask WE Guide
            </span>
          </button>
        )}
      </div>

      {/* Interactive Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="WE Guide AI Assistant Panel"
          aria-modal="true"
          className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[400px] h-[540px] max-h-[92vh] rounded-t-2xl sm:rounded-2xl bg-surface-card border border-border-strong shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-brand-primary text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/10 text-brand-accent border border-white/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-none">WE Guide</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
                    AI Assistant
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 mt-0.5">Platform Navigation & FAQs</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close WE Guide"
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* AI Disclosure Banner */}
          <div className="px-3.5 py-2 bg-surface-subtle border-b border-border-subtle flex items-start gap-2 text-[10px] text-text-muted leading-tight">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-accent shrink-0 mt-0.5" />
            <span>
              Responses are AI-generated for platform guidance and do not guarantee employment outcomes.
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div
            aria-live="polite"
            className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-surface-canvas"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 shadow-sm ${
                    msg.role === "user"
                      ? "bg-brand-primary text-white rounded-br-none"
                      : "bg-surface-card text-text-primary border border-border-subtle rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Direct Navigation CTA Link */}
                  {msg.ctaText && msg.ctaHref && (
                    <div className="pt-1.5">
                      <Link
                        href={msg.ctaHref}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-secondary text-[11px] font-bold transition-all shadow-xs"
                      >
                        <span>{msg.ctaText}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isPending && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-surface-card border border-border-subtle text-text-muted text-xs flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-accent" />
                  <span>WE Guide is thinking...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="p-2.5 rounded-xl bg-feedback-error-bg text-feedback-error-text text-xs flex items-center gap-2 border border-feedback-error-text/20"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 bg-surface-card border-t border-border-subtle flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickActionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.query)}
                disabled={isPending}
                className="px-2.5 py-1 rounded-full bg-surface-subtle hover:bg-brand-primary hover:text-white border border-border-subtle text-[11px] font-medium text-text-secondary whitespace-nowrap transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-surface-card border-t border-border-subtle flex items-center gap-2 shrink-0"
          >
            <Input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about jobs, applications, services..."
              maxLength={500}
              disabled={isPending}
              className="flex-1 text-xs h-9 bg-surface-canvas border-border-strong focus:ring-1 focus:ring-border-focus rounded-lg"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !inputMessage.trim()}
              aria-label="Send message to WE Guide"
              className="h-9 w-9 p-0 rounded-lg flex items-center justify-center shrink-0"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

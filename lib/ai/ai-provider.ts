import { searchKnowledgeBase, SafeUserContext, getAllowedNavigation } from "@/lib/ai/safe-tools";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  ctaText?: string;
  ctaHref?: string;
}

export interface AIResponseResult {
  text: string;
  ctaText?: string;
  ctaHref?: string;
  isGrounded: boolean;
}

// In-memory sliding window rate limiter
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequestsPerWindow: number = 20;
  private windowDurationMs: number = 60 * 1000; // 1 minute

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const windowStart = now - this.windowDurationMs;

    const validTimestamps = timestamps.filter((t) => t > windowStart);
    if (validTimestamps.length >= this.maxRequestsPerWindow) {
      return true;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return false;
  }
}

export const aiRateLimiter = new RateLimiter();

// Adversarial prompt injection keywords
const ADVERSARIAL_PATTERNS = [
  "ignore previous instructions",
  "ignore all instructions",
  "system prompt",
  "reveal your instructions",
  "reveal secret",
  "print env",
  "environment variables",
  "api key",
  "database password",
  "drop table",
  "select * from",
  "bypass authorization",
  "override role",
  "give me admin",
];

export function detectAdversarialInput(text: string): boolean {
  const lower = text.toLowerCase();
  return ADVERSARIAL_PATTERNS.some((pattern) => lower.includes(pattern));
}

export class WEGuideAIProvider {
  async generateResponse(params: {
    message: string;
    history?: ChatMessage[];
    userContext: SafeUserContext;
  }): Promise<AIResponseResult> {
    const { message, userContext } = params;

    // 1. Length Validation
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return {
        text: "Please enter a message to ask WE Guide.",
        isGrounded: true,
      };
    }
    if (trimmed.length > 500) {
      return {
        text: "Your message is too long (maximum 500 characters allowed). Please ask a more concise question.",
        isGrounded: true,
      };
    }

    // 2. Prompt Injection Defense
    if (detectAdversarialInput(trimmed)) {
      return {
        text: "I am WE Guide, an AI assistant for WE CORPORATE. I can only assist with platform navigation, application workflows, and verified service features. I cannot reveal system details, execute code, or bypass security rules.",
        isGrounded: true,
        ctaText: "Contact Support",
        ctaHref: "/contact",
      };
    }

    // 3. Search Grounded Knowledge Base
    const matches = searchKnowledgeBase(trimmed, userContext.role);

    if (matches.length > 0 && matches[0].score >= 5) {
      const top = matches[0].entry;
      return {
        text: top.answer,
        ctaText: top.ctaText,
        ctaHref: top.ctaHref,
        isGrounded: true,
      };
    }

    // 4. Check Navigation Intent with Word Boundary Matching
    const allowedNav = getAllowedNavigation(userContext.role);
    const navMatch = allowedNav.find((r) => {
      const pathPart = r.path.replace(/^\//, "").toLowerCase();
      const labelPart = r.label.toLowerCase();
      const regexLabel = new RegExp(`\\b${labelPart}\\b`, "i");
      const regexPath = new RegExp(`\\b${pathPart}\\b`, "i");
      return regexLabel.test(trimmed) || (pathPart.length > 3 && regexPath.test(trimmed));
    });

    if (navMatch) {
      return {
        text: `You can access the ${navMatch.label} page using the link below.`,
        ctaText: `Open ${navMatch.label}`,
        ctaHref: navMatch.path,
        isGrounded: true,
      };
    }

    // 5. Hallucination Control / Safe Fallback
    return {
      text: "I don't have enough specific information on that topic in our platform knowledge base. For personalized assistance, technical inquiries, or partnership questions, please reach out to our team.",
      ctaText: "Contact Support",
      ctaHref: "/contact",
      isGrounded: false,
    };
  }
}

export const weGuideProvider = new WEGuideAIProvider();

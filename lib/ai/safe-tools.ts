import { PLATFORM_KNOWLEDGE_BASE, KnowledgeBaseEntry } from "@/lib/ai/knowledge-base";
import { UserRole } from "@/types";

export interface SafeUserContext {
  role: UserRole | "anonymous";
  isAuthenticated: boolean;
  name?: string;
  currentPath?: string;
}

export interface NavigationRoute {
  label: string;
  path: string;
  category: "public" | "candidate" | "employer" | "admin";
}

export const CANONICAL_ROUTES: NavigationRoute[] = [
  // Public
  { label: "Home", path: "/", category: "public" },
  { label: "Jobs Discovery", path: "/jobs", category: "public" },
  { label: "Internships Discovery", path: "/internships", category: "public" },
  { label: "Career Services", path: "/career-services", category: "public" },
  { label: "About Us", path: "/about", category: "public" },
  { label: "Contact Support", path: "/contact", category: "public" },
  { label: "Sign In", path: "/auth/login", category: "public" },
  { label: "Candidate Sign Up", path: "/auth/signup", category: "public" },
  { label: "Employer Registration", path: "/auth/employer/signup", category: "public" },

  // Candidate
  { label: "Applications Tracker", path: "/c/applications", category: "candidate" },
  { label: "Saved Opportunities", path: "/c/saved", category: "candidate" },
  { label: "Resume Vault", path: "/c/resumes", category: "candidate" },
  { label: "Candidate Profile", path: "/c/profile", category: "candidate" },
  { label: "Consulting Hub", path: "/c/consulting", category: "candidate" },
  { label: "Candidate Settings", path: "/c/settings", category: "candidate" },

  // Employer
  { label: "Employer Jobs Manager", path: "/e/jobs", category: "employer" },
  { label: "Post a New Job", path: "/e/jobs/new", category: "employer" },
  { label: "Company Profile", path: "/e/company", category: "employer" },
  { label: "Employer Verification", path: "/e/verification", category: "employer" },
  { label: "Employer Settings", path: "/e/settings", category: "employer" },

  // Admin
  { label: "Job Moderation Queue", path: "/admin/jobs/moderation", category: "admin" },
  { label: "Consulting Fulfillment Console", path: "/admin/consulting", category: "admin" },
  { label: "Employer Queue", path: "/admin/employers/queue", category: "admin" },
];

export function getAllowedNavigation(role: UserRole | "anonymous"): NavigationRoute[] {
  if (role === "admin") {
    return CANONICAL_ROUTES;
  }
  if (role === "employer") {
    return CANONICAL_ROUTES.filter((r) => r.category === "public" || r.category === "employer");
  }
  if (role === "candidate") {
    return CANONICAL_ROUTES.filter((r) => r.category === "public" || r.category === "candidate");
  }
  return CANONICAL_ROUTES.filter((r) => r.category === "public");
}

const STOP_WORDS = new Set([
  "what", "where", "when", "why", "which", "how", "who", "whom", "whose",
  "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "from", "up", "down", "out", "off", "over", "under", "again", "further", "then", "once",
  "can", "could", "should", "would", "may", "might", "must", "shall", "will",
  "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "she", "her", "hers", "it", "its", "they", "them", "their", "theirs", "we", "us", "our", "ours", "i", "me", "my", "myself"
]);

export function searchKnowledgeBase(
  query: string,
  userRole: UserRole | "anonymous"
): { entry: KnowledgeBaseEntry; score: number }[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const substantiveTokens = queryTokens.filter((t) => !STOP_WORDS.has(t));

  const results: { entry: KnowledgeBaseEntry; score: number }[] = [];

  for (const entry of PLATFORM_KNOWLEDGE_BASE) {
    // Role check: Ensure entry is permitted for the current user's role
    if (entry.allowedRoles && !entry.allowedRoles.includes(userRole as "candidate" | "employer" | "admin")) {
      continue;
    }

    let score = 0;

    // Exact question match
    if (entry.question.toLowerCase().includes(normalizedQuery)) {
      score += 20;
    }

    // Keyword match
    for (const keyword of entry.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 8;
      }
      for (const token of substantiveTokens) {
        if (keyword.toLowerCase() === token) {
          score += 6;
        } else if (keyword.toLowerCase().includes(token) || token.includes(keyword.toLowerCase())) {
          score += 3;
        }
      }
    }

    // Question substantive token overlap
    for (const token of substantiveTokens) {
      if (entry.question.toLowerCase().includes(token)) {
        score += 2;
      }
    }

    if (score >= 5) {
      results.push({ entry, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

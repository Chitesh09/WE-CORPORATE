"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import {
  weGuideProvider,
  aiRateLimiter,
  ChatMessage,
  AIResponseResult,
} from "@/lib/ai/ai-provider";
import { SafeUserContext } from "@/lib/ai/safe-tools";
import { ActionResult } from "@/types";

const askSchema = z.object({
  message: z
    .string()
    .min(1, "Please enter a message.")
    .max(500, "Message is too long (max 500 characters)."),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(1000),
        ctaText: z.string().optional(),
        ctaHref: z.string().optional(),
      })
    )
    .max(10)
    .optional(),
  currentPath: z.string().max(200).optional(),
});

export async function askWeGuideAction(
  params: z.infer<typeof askSchema>
): Promise<ActionResult<AIResponseResult>> {
  try {
    const validated = askSchema.safeParse(params);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid query format.",
      };
    }

    const user = await getCurrentUser();
    const rateLimitKey = user ? `usr_${user.id}` : "anon_global";

    if (aiRateLimiter.isRateLimited(rateLimitKey)) {
      return {
        success: false,
        error: "You are sending messages too quickly. Please wait a moment before trying again.",
      };
    }

    const safeContext: SafeUserContext = {
      role: user ? user.role : "anonymous",
      isAuthenticated: user !== null,
      name: user ? user.fullName : undefined,
      currentPath: validated.data.currentPath,
    };

    const response = await weGuideProvider.generateResponse({
      message: validated.data.message,
      history: validated.data.history as ChatMessage[],
      userContext: safeContext,
    });

    return {
      success: true,
      data: response,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process query with WE Guide.";
    return { success: false, error: message };
  }
}

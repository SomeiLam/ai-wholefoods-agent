// types/ActionPlan.ts
import { z } from 'zod';
import type { KeyInput } from 'puppeteer';

// --- Step definitions ---
export const AIActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('click'), selector: z.string() }),
  z.object({ type: z.literal('clickByText'), text: z.string() }),
  z.object({ type: z.literal('type'), selector: z.string(), value: z.string() }),
  z.object({ type: z.literal('press'), key: z.string() }),
  z.object({ type: z.literal('goto'), url: z.string().url() }),
  z.object({ type: z.literal('waitForSelector'), selector: z.string() }),
  z.object({ type: z.literal('select'), selector: z.string(), value: z.string() }),
  z.object({ type: z.literal('log'), message: z.string().optional() }),
]);

// --- ActionPlan schema ---
export const ActionPlanSchema = z.object({
  plan: z.array(AIActionSchema),
  comment: z.string().optional(),
});

// --- Types for use in code ---
export type AIAction = z.infer<typeof AIActionSchema>;
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

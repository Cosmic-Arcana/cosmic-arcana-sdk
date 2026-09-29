// Zod mirrors of the MCP contracts, for servers that register tools with the MCP SDK.
//
// Kept behind the `@cosmic-arcana/sdk/mcp` subpath with zod as an optional peer dependency, so the
// services that only need the plain contracts never pull zod in. The `satisfies` clauses make the
// compiler fail if a schema drifts from the type it mirrors.
import { z } from 'zod';
import {
  PREVIOUS_READINGS_LIMIT,
  type PreviousReadingsOutputV1,
  type ReadingCardV1,
  type ReadingSummaryV1,
} from '../contracts/mcp';

export const readingCardSchema = z.object({
  name: z.string(),
  reversed: z.boolean(),
}) satisfies z.ZodType<ReadingCardV1>;

export const readingSummarySchema = z.object({
  id: z.string(),
  readAt: z.string().describe('ISO 8601 date-time'),
  topic: z.string(),
  spread: z.string(),
  cards: z.array(readingCardSchema),
  summary: z.string(),
}) satisfies z.ZodType<ReadingSummaryV1>;

/** `limit` carries a default, so the agent may omit it: the parsed value is always a number. */
export const previousReadingsInputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(PREVIOUS_READINGS_LIMIT.min)
    .max(PREVIOUS_READINGS_LIMIT.max)
    .default(PREVIOUS_READINGS_LIMIT.default)
    .describe('How many recent readings to return, newest first.'),
});

export const previousReadingsOutputSchema = z.object({
  readings: z.array(readingSummarySchema),
}) satisfies z.ZodType<PreviousReadingsOutputV1>;

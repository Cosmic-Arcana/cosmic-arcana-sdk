import type { ReadingSummaryV1 } from './reading-summary.v1';

/** Identity of the MCP server an agent connects to, and the tools it may call. */
export const MCP_SERVER_NAME = 'cosmic-arcana-mcp';

/** Path the MCP transport is mounted on. */
export const MCP_HTTP_ROUTE = 'mcp';

export const MCP_TOOLS = {
  previousReadings: 'get_previous_readings',
} as const;

export type McpToolName = (typeof MCP_TOOLS)[keyof typeof MCP_TOOLS];

export const PREVIOUS_READINGS_LIMIT = { min: 1, max: 10, default: 3 } as const;

export interface PreviousReadingsInputV1 {
  limit: number;
}

export interface PreviousReadingsOutputV1 {
  readings: ReadingSummaryV1[];
}

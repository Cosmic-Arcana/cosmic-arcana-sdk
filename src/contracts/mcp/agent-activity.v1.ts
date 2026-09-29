import { ContractViolationError } from '../contract-violation.error';
import { isIsoDateTime, isNonEmptyString, requireField, requireRecord } from '../guards';

/**
 * Who the MCP server is serving. `userId` comes from the on-behalf-of token's `sub`, `agent` from
 * its `act` claim: the agent acts for the user, it is never the user.
 */
export interface AgentActorV1 {
  userId: string;
  agent: string | null;
  scopes: string[];
}

export const AGENT_ACTIVITY_KINDS = [
  'session.opened',
  'session.closed',
  'tool.called',
  'tool.completed',
  'tool.failed',
  'resource.read',
] as const;

export type AgentActivityKindV1 = (typeof AGENT_ACTIVITY_KINDS)[number];

/**
 * One line of the agent's activity feed. Payloads are already redacted by the producer: this
 * contract carries what a user may watch, not raw tool traffic.
 */
export interface AgentActivityEventV1 {
  version: 1;
  eventId: string;
  sessionId: string;
  occurredAt: string;
  kind: AgentActivityKindV1;
  actor: AgentActorV1;
  target: string | null;
  request: unknown;
  response: unknown;
  durationMs: number | null;
  outcome: 'success' | 'error' | null;
  error: { name: string; message: string } | null;
}

export interface AgentSessionV1 {
  sessionId: string;
  actor: AgentActorV1;
  startedAt: string;
  lastSeenAt: string;
  open: boolean;
  toolCalls: number;
  errors: number;
}

export interface AgentActivityFeedV1 {
  sessions: AgentSessionV1[];
  events: AgentActivityEventV1[];
}

const parseActor = (value: unknown): AgentActorV1 => {
  const contract = 'agent actor';
  const actor = requireRecord(value, contract);
  const scopes = actor.scopes;
  if (!Array.isArray(scopes) || scopes.some((scope) => typeof scope !== 'string')) {
    throw new ContractViolationError(`${contract}: invalid scopes`);
  }
  return {
    userId: requireField(actor, 'userId', isNonEmptyString, contract),
    agent: typeof actor.agent === 'string' ? actor.agent : null,
    scopes: scopes as string[],
  };
};

export const parseAgentActivityEventV1 = (value: unknown): AgentActivityEventV1 => {
  const contract = 'agent activity event';
  const event = requireRecord(value, contract);

  if (event.version !== 1) {
    throw new ContractViolationError(`${contract}: unsupported version ${String(event.version)}`);
  }
  const kind = event.kind;
  if (!AGENT_ACTIVITY_KINDS.includes(kind as AgentActivityKindV1)) {
    throw new ContractViolationError(`${contract}: unknown kind ${String(kind)}`);
  }
  const outcome = event.outcome ?? null;
  if (outcome !== null && outcome !== 'success' && outcome !== 'error') {
    throw new ContractViolationError(`${contract}: invalid outcome ${String(outcome)}`);
  }

  return {
    version: 1,
    eventId: requireField(event, 'eventId', isNonEmptyString, contract),
    sessionId: requireField(event, 'sessionId', isNonEmptyString, contract),
    occurredAt: requireField(event, 'occurredAt', isIsoDateTime, contract),
    kind: kind as AgentActivityKindV1,
    actor: parseActor(event.actor),
    target: typeof event.target === 'string' ? event.target : null,
    request: event.request ?? null,
    response: event.response ?? null,
    durationMs: typeof event.durationMs === 'number' ? event.durationMs : null,
    outcome,
    error:
      event.error && typeof event.error === 'object'
        ? {
            name: String((event.error as { name?: unknown }).name ?? 'Error'),
            message: String((event.error as { message?: unknown }).message ?? ''),
          }
        : null,
  };
};

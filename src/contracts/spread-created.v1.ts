import { ContractViolationError } from './contract-violation.error';
import { parseEventEnvelope, type EventEnvelope } from './event-envelope';
import { isIsoDateTime, isUuid, requireField, requireRecord } from './guards';

export const SPREAD_CREATED_EVENT = 'spread.created';

/**
 * A BullMQ queue is a work queue, not a topic: every consumer on it competes for jobs.
 * One queue is enough while history-service-api is the only projection.
 */
export const SPREAD_CREATED_QUEUE = 'spread.created';

/** Thin past-tense fact. Consumers that need the spread's content re-query tarot-service-api. */
export interface SpreadCreatedV1 {
  version: 1;
  eventId: string;
  spreadId: string;
  userId: string;
  occurredAt: string;
}

export type SpreadCreatedEnvelope = EventEnvelope<SpreadCreatedV1>;

export const parseSpreadCreatedV1 = (value: unknown): SpreadCreatedV1 => {
  const contract = SPREAD_CREATED_EVENT;
  const event = requireRecord(value, contract);

  if (event.version !== 1) {
    throw new ContractViolationError(`${contract}: unsupported version ${String(event.version)}`);
  }

  return {
    version: 1,
    eventId: requireField(event, 'eventId', isUuid, contract),
    spreadId: requireField(event, 'spreadId', isUuid, contract),
    userId: requireField(event, 'userId', isUuid, contract),
    occurredAt: requireField(event, 'occurredAt', isIsoDateTime, contract),
  };
};

export const parseSpreadCreatedEnvelope = (value: unknown): SpreadCreatedEnvelope =>
  parseEventEnvelope(value, parseSpreadCreatedV1);

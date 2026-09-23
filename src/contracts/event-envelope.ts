import { isCorrelationId, isNonEmptyString, requireField, requireRecord } from './guards';

export interface EventMeta {
  correlationId: string;
  producer: string;
}

/**
 * Broker wrapper for a domain event. Correlation metadata travels beside the event, so the
 * event itself stays a thin domain fact.
 */
export interface EventEnvelope<TEvent> {
  meta: EventMeta;
  data: TEvent;
}

export const parseEventEnvelope = <TEvent>(
  value: unknown,
  parseData: (data: unknown) => TEvent,
): EventEnvelope<TEvent> => {
  const contract = 'event envelope';
  const envelope = requireRecord(value, contract);
  const meta = requireRecord(envelope.meta, `${contract} meta`);

  return {
    meta: {
      correlationId: requireField(meta, 'correlationId', isCorrelationId, contract),
      producer: requireField(meta, 'producer', isNonEmptyString, contract),
    },
    data: parseData(envelope.data),
  };
};

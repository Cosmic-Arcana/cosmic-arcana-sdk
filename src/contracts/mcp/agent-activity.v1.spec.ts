import { ContractViolationError } from '../contract-violation.error';
import { parseAgentActivityEventV1 } from './agent-activity.v1';
import { parseReadingSummaryV1 } from './reading-summary.v1';

const validEvent = {
  version: 1,
  eventId: 'evt_01',
  sessionId: 'sess_01',
  occurredAt: '2026-09-24T10:15:30.123Z',
  kind: 'tool.completed',
  actor: { userId: 'user_01', agent: 'claude', scopes: ['readings:read'] },
  target: 'get_previous_readings',
  request: { limit: 3 },
  response: { readings: [] },
  durationMs: 42,
  outcome: 'success',
  error: null,
};

describe('parseAgentActivityEventV1', () => {
  it('accepts a complete event', () => {
    expect(parseAgentActivityEventV1(validEvent)).toEqual(validEvent);
  });

  it('fills the optional fields it is allowed to default', () => {
    const { target, request, response, durationMs, outcome, error, ...minimal } = validEvent;
    expect(parseAgentActivityEventV1({ ...minimal, kind: 'session.opened' })).toMatchObject({
      target: null,
      request: null,
      response: null,
      durationMs: null,
      outcome: null,
      error: null,
    });
  });

  it.each([
    ['an unsupported version', { ...validEvent, version: 2 }],
    ['an unknown kind', { ...validEvent, kind: 'tool.exploded' }],
    ['an invalid outcome', { ...validEvent, outcome: 'maybe' }],
    ['an actor without a user', { ...validEvent, actor: { agent: 'claude', scopes: [] } }],
    ['non-string scopes', { ...validEvent, actor: { userId: 'u', agent: null, scopes: [1] } }],
  ])('rejects %s', (_case, value) => {
    expect(() => parseAgentActivityEventV1(value)).toThrow(ContractViolationError);
  });
});

describe('parseReadingSummaryV1', () => {
  const summary = {
    id: 'reading_01',
    readAt: '2026-09-20T18:00:00.000Z',
    topic: 'career',
    spread: 'three-card',
    cards: [{ name: 'The Star', reversed: false }],
    summary: 'patience pays',
  };

  it('accepts a summary and drops unknown fields', () => {
    expect(parseReadingSummaryV1({ ...summary, prediction: 'leaked' })).toEqual(summary);
  });

  it('rejects a card without an orientation', () => {
    expect(() => parseReadingSummaryV1({ ...summary, cards: [{ name: 'The Star' }] })).toThrow(
      ContractViolationError,
    );
  });
});

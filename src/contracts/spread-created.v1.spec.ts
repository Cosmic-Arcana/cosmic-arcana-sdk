import { ContractViolationError } from './contract-violation.error';
import { parseSpreadCreatedEnvelope, parseSpreadCreatedV1 } from './spread-created.v1';

const validEvent = {
  version: 1,
  eventId: '0b5e8a7e-3f5b-4b0e-9d2a-4a3f7f1c2d10',
  spreadId: '6f1d2c3b-4a5e-4f60-8b7a-9c0d1e2f3a4b',
  userId: 'c2a1b0d9-8e7f-4a6b-9c5d-4e3f2a1b0c9d',
  occurredAt: '2026-09-22T10:15:30.123Z',
};

describe('parseSpreadCreatedV1', () => {
  it('accepts a valid event and drops unknown fields', () => {
    expect(parseSpreadCreatedV1({ ...validEvent, prediction: 'leaked' })).toEqual(validEvent);
  });

  it.each([
    ['an unsupported version', { ...validEvent, version: 2 }],
    ['a non-uuid eventId', { ...validEvent, eventId: 'event-1' }],
    ['a missing spreadId', { ...validEvent, spreadId: undefined }],
    ['a date without time', { ...validEvent, occurredAt: '2026-09-22' }],
    ['a non-object', 'spread.created'],
  ])('rejects %s', (_case, value) => {
    expect(() => parseSpreadCreatedV1(value)).toThrow(ContractViolationError);
  });
});

describe('parseSpreadCreatedEnvelope', () => {
  const meta = { correlationId: 'corr-12345678', producer: 'tarot-service-api' };

  it('parses meta and data', () => {
    expect(parseSpreadCreatedEnvelope({ meta, data: validEvent })).toEqual({
      meta,
      data: validEvent,
    });
  });

  it('rejects an envelope without a valid correlation id', () => {
    expect(() =>
      parseSpreadCreatedEnvelope({ meta: { ...meta, correlationId: 'x' }, data: validEvent }),
    ).toThrow(ContractViolationError);
  });
});

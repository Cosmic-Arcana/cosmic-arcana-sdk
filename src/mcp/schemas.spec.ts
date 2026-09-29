import { parseReadingSummaryV1 } from '../contracts/mcp';
import { previousReadingsInputSchema, readingSummarySchema } from './index';

describe('mcp schemas', () => {
  const summary = {
    id: 'reading_01',
    readAt: '2026-09-20T18:00:00.000Z',
    topic: 'career',
    spread: 'three-card',
    cards: [{ name: 'The Star', reversed: true }],
    summary: 'patience pays',
  };

  it('agrees with the plain parser on the same payload', () => {
    expect(readingSummarySchema.parse(summary)).toEqual(parseReadingSummaryV1(summary));
  });

  it('defaults the limit an agent may omit', () => {
    expect(previousReadingsInputSchema.parse({})).toEqual({ limit: 3 });
  });

  it('rejects a limit outside the advertised range', () => {
    expect(() => previousReadingsInputSchema.parse({ limit: 99 })).toThrow();
  });
});

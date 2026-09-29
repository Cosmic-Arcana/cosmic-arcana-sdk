import { ContractViolationError } from '../contract-violation.error';
import {
  isBoolean,
  isIsoDateTime,
  isNonEmptyString,
  requireField,
  requireRecord,
} from '../guards';

/**
 * What the agent is allowed to see about a past reading. Deliberately a summary: the agent gets
 * enough to reason about history without the full prediction text of every past reading.
 */
export interface ReadingCardV1 {
  name: string;
  reversed: boolean;
}

export interface ReadingSummaryV1 {
  id: string;
  readAt: string;
  topic: string;
  spread: string;
  cards: ReadingCardV1[];
  summary: string;
}

const parseReadingCardV1 = (value: unknown): ReadingCardV1 => {
  const contract = 'reading card';
  const card = requireRecord(value, contract);
  return {
    name: requireField(card, 'name', isNonEmptyString, contract),
    reversed: requireField(card, 'reversed', isBoolean, contract),
  };
};

export const parseReadingSummaryV1 = (value: unknown): ReadingSummaryV1 => {
  const contract = 'reading summary';
  const reading = requireRecord(value, contract);

  if (!Array.isArray(reading.cards)) {
    throw new ContractViolationError(`${contract}: invalid cards`);
  }

  return {
    id: requireField(reading, 'id', isNonEmptyString, contract),
    readAt: requireField(reading, 'readAt', isIsoDateTime, contract),
    topic: requireField(reading, 'topic', isNonEmptyString, contract),
    spread: requireField(reading, 'spread', isNonEmptyString, contract),
    cards: reading.cards.map(parseReadingCardV1),
    summary: requireField(reading, 'summary', isNonEmptyString, contract),
  };
};

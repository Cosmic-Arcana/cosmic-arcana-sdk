import { ContractViolationError } from './contract-violation.error';
import {
  isBoolean,
  isIsoDateTime,
  isNonEmptyString,
  isUuid,
  requireField,
  requireRecord,
} from './guards';

// TODO(product): the card shape and prediction format are not defined yet. The card mirrors the
// fields ai-service-api's draw already returns (positionKey, cardId, reversed).
export interface SpreadCardV1 {
  positionKey: string;
  cardId: string;
  reversed: boolean;
}

/** tarot-service-api's `GET /spreads/:spreadId` response: the source-of-truth spread. */
export interface SpreadDetailsV1 {
  spreadId: string;
  userId: string;
  question: string;
  cards: SpreadCardV1[];
  prediction: string;
  createdAt: string;
}

const parseSpreadCardV1 = (value: unknown): SpreadCardV1 => {
  const contract = 'spread card';
  const card = requireRecord(value, contract);
  return {
    positionKey: requireField(card, 'positionKey', isNonEmptyString, contract),
    cardId: requireField(card, 'cardId', isNonEmptyString, contract),
    reversed: requireField(card, 'reversed', isBoolean, contract),
  };
};

export const parseSpreadDetailsV1 = (value: unknown): SpreadDetailsV1 => {
  const contract = 'spread details';
  const spread = requireRecord(value, contract);

  if (!Array.isArray(spread.cards)) {
    throw new ContractViolationError(`${contract}: invalid cards`);
  }

  return {
    spreadId: requireField(spread, 'spreadId', isUuid, contract),
    userId: requireField(spread, 'userId', isUuid, contract),
    question: requireField(spread, 'question', isNonEmptyString, contract),
    cards: spread.cards.map(parseSpreadCardV1),
    prediction: requireField(spread, 'prediction', isNonEmptyString, contract),
    createdAt: requireField(spread, 'createdAt', isIsoDateTime, contract),
  };
};

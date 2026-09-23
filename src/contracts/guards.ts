import { ContractViolationError } from './contract-violation.error';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/;
const CORRELATION_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export type Guard<T> = (value: unknown) => value is T;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isUuid: Guard<string> = (value): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value);

export const isIsoDateTime: Guard<string> = (value): value is string =>
  typeof value === 'string' && ISO_8601_PATTERN.test(value) && !Number.isNaN(Date.parse(value));

export const isNonEmptyString: Guard<string> = (value): value is string =>
  typeof value === 'string' && value.length > 0;

export const isBoolean: Guard<boolean> = (value): value is boolean => typeof value === 'boolean';

export const isCorrelationId: Guard<string> = (value): value is string =>
  typeof value === 'string' && CORRELATION_ID_PATTERN.test(value);

export const requireRecord = (value: unknown, contract: string): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new ContractViolationError(`${contract}: expected an object`);
  }
  return value;
};

export const requireField = <T>(
  record: Record<string, unknown>,
  key: string,
  guard: Guard<T>,
  contract: string,
): T => {
  const value = record[key];
  if (!guard(value)) {
    throw new ContractViolationError(`${contract}: invalid ${key}`);
  }
  return value;
};

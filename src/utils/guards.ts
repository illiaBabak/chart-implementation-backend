import { User } from "../types";

export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number";

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

export const isDate = (data: unknown): data is Date => {
  if (isString(data)) return !isNaN(new Date(data).getTime());
  return data instanceof Date;
};

export const isUser = (value: unknown): value is User =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  "name" in value &&
  "age" in value &&
  "gender" in value &&
  "workplace" in value &&
  "industry" in value &&
  "location" in value &&
  "birth_date" in value &&
  isNumber(value.id) &&
  isString(value.name) &&
  isNumber(value.age) &&
  isString(value.gender) &&
  isString(value.workplace) &&
  isString(value.industry) &&
  isString(value.location) &&
  isDate(value.birth_date);

export const isUserArray = (value: unknown): value is User[] =>
  Array.isArray(value) && value.every(isUser);

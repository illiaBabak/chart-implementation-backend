import { db } from "../db";
import { User } from "../types";
import { isUserArray } from "../utils/guards";

export const getUsers = async (): Promise<User[]> => {
  const [rows] = await db.query("SELECT * FROM users");

  return isUserArray(rows) ? rows : [];
};

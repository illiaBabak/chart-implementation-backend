import { db } from "../db";
import { User } from "../types";
import { isUserArray } from "../utils/guards";

export const getUsers = async (): Promise<User[]> => {
  const [rows] = await db.query("SELECT * FROM users");

  if (!rows) throw new Error("No users found");

  return isUserArray(rows) ? rows : [];
};

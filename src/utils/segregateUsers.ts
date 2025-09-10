import { User } from "../types";
import { isDate } from "./guards";
import { CHART_TYPES } from "./constants";
import { generateRandomColor } from "./generateRandomColor";

// * Segregate users by chart type
export const segregateUsers = (
  users: User[],
  chartType: (typeof CHART_TYPES)[number]
) => {
  if (!users) return [];

  const totalUsers = users.length;

  const countMap = users.reduce((acc: Record<string, number>, user) => {
    const value = user[chartType as keyof User];

    const key = isDate(value)
      ? new Date(value).getFullYear().toString()
      : value.toString();

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(countMap).map(([key, count]) => ({
    label: key,
    percentage: Number(((count / totalUsers) * 100).toFixed(1)),
    color: generateRandomColor(),
  }));
};

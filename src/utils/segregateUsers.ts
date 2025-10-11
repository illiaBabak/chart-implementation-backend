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

  const usersCountByCategory = users.reduce(
    (acc: Record<string, number>, user) => {
      const userField = user[chartType as keyof User];

      const isUserFieldDate = isDate(userField);

      const yearFromDate = new Date(userField).getFullYear().toString();

      const key = isUserFieldDate ? yearFromDate : userField.toString();

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(usersCountByCategory).map(([key, count]) => ({
    label: key,
    percentage: Number(((count / totalUsers) * 100).toFixed(1)),
    color: generateRandomColor(),
  }));
};

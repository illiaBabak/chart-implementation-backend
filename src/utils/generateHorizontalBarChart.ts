import { Content } from "pdfmake/interfaces";

const BAR_HEIGHT = 10;
const PDF_WIDTH = 515.28;

export const generateHorizontalBarChart = (
  users: { label: string; percentage: number; color: string }[]
): Content[] =>
  users.map((user) => ({
    stack: [
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: (user.percentage / 100) * PDF_WIDTH,
            h: BAR_HEIGHT,
            color: user.color,
          },
        ],
        margin: [0, 0, 0, 6],
      },

      {
        text: `${user.label} - ${user.percentage}%`,
        fontSize: 12,
        bold: true,
        alignment: "left",
        margin: [0, 0, 0, 4],
      },
    ],
    margin: [0, 0, 0, 20],
  }));

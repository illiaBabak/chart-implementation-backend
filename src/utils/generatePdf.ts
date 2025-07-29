import PdfPrinter from "pdfmake";
import { capitalize } from "./capitalize";
import { FONTS } from "./constants";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { generateSVGChart } from "./generateSVGChart";
import { generateHorizontalBarChart } from "./generateHorizontalBarChart";

export const generatePdf = async (
  users: {
    label: string;
    percentage: number;
    color: string;
  }[],
  chartType: string,
  version: number
) => {
  const currentDate = new Date(Date.now()).toUTCString();

  const svg = generateSVGChart(
    users.map((user) => ({
      percentage: Number(user.percentage),
      color: user.color,
    }))
  );

  const printer = new PdfPrinter(FONTS);

  const docDefinition: TDocumentDefinitions = {
    header: {
      text: `User stats - ${capitalize(chartType)}, ${currentDate}`,
      fontSize: 16,
      bold: true,
      alignment: "center",
      margin: [0, 10],
    },

    footer: (currentPage: number): Content => {
      return {
        columns: [
          {
            text: "",
            width: "*",
          },
          {
            text: `Version ${version}`,
            fontSize: 12,
            bold: true,
            alignment: "center",
          },
          {
            text: `${currentPage}`,
            fontSize: 12,
            bold: true,
            alignment: "right",
            margin: [0, 0, 10, 0],
          },
        ],
      };
    },

    content: [
      {
        table: {
          widths: ["70%", "30%"],
          body: [
            [
              {
                svg: svg,
                width: 250,
                height: 250,
                alignment: "center",
              },
              {
                stack: [
                  {
                    text: "Legend",
                    fontSize: 16,
                    bold: true,
                    margin: [0, 0, 0, 10],
                  },
                  ...users.map((user) => ({
                    columns: [
                      {
                        canvas: [
                          {
                            type: "rect",
                            x: 0,
                            y: 0,
                            w: 15,
                            h: 15,
                            color: user.color,
                          },
                        ],
                        width: 20,
                      },
                      {
                        text: `${user.label}`,
                        margin: [5, 2, 0, 2],
                      },
                    ],
                    margin: [0, 2],
                  })),
                ],
                margin: [20, 0, 0, 0],
              },
            ],
          ],
        },
        layout: "noBorders",
      },

      {
        text: "Bar Chart",
        fontSize: 14,
        bold: true,
        alignment: "center",
        margin: [0, 10, 0, 20],
      },
      ...generateHorizontalBarChart(
        users.map((user) => ({
          percentage: Number(user.percentage),
          color: user.color,
          label: user.label,
        }))
      ),
    ],
  };

  return printer.createPdfKitDocument(docDefinition);
};

import PdfPrinter from "pdfmake";
import { capitalize } from "./capitalize";
import { FONTS } from "./constants";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { generateSVGChart } from "./generateSVGChart";

export const generatePdf = async (
  data: Record<string, string | number | boolean>[],
  chartType: string,
  version: number
) => {
  const currentDate = new Date(Date.now()).toUTCString();

  const svg = generateSVGChart(
    data.map((item) => ({
      percentage: Number(item.percentage),
      color: item.color as string,
    }))
  );

  const printer = new PdfPrinter(FONTS);

  const headers = Object.keys(data[0]);

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
          body: [
            [...headers.map((header) => capitalize(header))],
            ...data.map((item) => Object.values(item)),
          ],
        },
      },
    ],
  };

  return printer.createPdfKitDocument(docDefinition);
};

import PdfPrinter from "pdfmake";
import { capitalize } from "./capitalize";
import { FONTS } from "./constants";

export const generatePdf = async (
  data: Record<string, string | number | boolean>[]
) => {
  const printer = new PdfPrinter(FONTS);

  const headers = Object.keys(data[0]);

  const docDefinition = {
    content: [
      {
        text: "User stats",
        fontSize: 16,
        bold: true,
      },
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

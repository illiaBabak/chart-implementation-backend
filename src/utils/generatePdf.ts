import PdfPrinter from "pdfmake";
import { FONTS } from "./constants";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { generateSVGChart } from "./generateSVGChart";
import { generateHorizontalBarChart } from "./generateHorizontalBarChart";

class PDFBuilder {
  protected document: TDocumentDefinitions = {
    content: [],
  };
  protected header: Content | null = null;
  protected footer: Content | ((currentPage: number) => Content) | null = null;

  setHeader(header: Content) {
    this.header = header;
  }

  setFooter(footer: Content | ((currentPage: number) => Content)) {
    this.footer = footer;
  }

  saveDocument() {
    const printer = new PdfPrinter(FONTS);

    if (this.header) this.document.header = this.header;
    if (this.footer) this.document.footer = this.footer;

    return printer.createPdfKitDocument(this.document);
  }
}

export class ChartBuilder extends PDFBuilder {
  constructor() {
    super();
  }

  addSVGChart(
    users: {
      label: string;
      percentage: number;
      color: string;
    }[]
  ) {
    (this.document.content as Content[]).push({
      table: {
        widths: ["70%", "30%"],
        body: [
          [
            {
              svg: generateSVGChart(users),
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
    });
  }

  addHorizontalBarChart(
    users: {
      label: string;
      percentage: number;
      color: string;
    }[]
  ) {
    (this.document.content as Content[]).push({
      stack: [
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
    });
  }
}

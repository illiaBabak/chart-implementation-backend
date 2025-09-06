import PdfPrinter from "pdfmake";
import { FONTS } from "./constants";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { generateSVGChart } from "./generateSVGChart";
import { generateHorizontalBarChart } from "./generateHorizontalBarChart";
import { analyzeChart, translateText } from "../services/ollamaServices";

class PDFBuilder {
  protected document: TDocumentDefinitions & { content: Content[] } = {
    content: [],
    defaultStyle: { font: "NotoCJK" },
  };

  setHeader(header: Content) {
    this.document.header = header;
  }

  setFooter(footer: Content | ((currentPage: number) => Content)) {
    this.document.footer = footer;
  }

  saveDocument() {
    const printer = new PdfPrinter(FONTS);

    return printer.createPdfKitDocument(this.document);
  }
}

export class ChartBuilder extends PDFBuilder {
  private language: string;

  constructor(language: string) {
    super();
    this.language = language;
  }

  async addSVGChart(
    users: {
      label: string;
      percentage: number;
      color: string;
    }[]
  ) {
    this.document.content.push({
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
                  text: await translateText("Legend", this.language),
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

  async addHorizontalBarChart(
    users: {
      label: string;
      percentage: number;
      color: string;
    }[]
  ) {
    this.document.content.push({
      stack: [
        {
          text: await translateText("Bar Chart", this.language),
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

  async addChartAnalysis(
    users: {
      label: string;
      percentage: number;
      color: string;
    }[]
  ) {
    this.document.content.push({
      text: await translateText(await analyzeChart(users), this.language),
      fontSize: 14,
      bold: true,
      alignment: "center",
      margin: [0, 10, 0, 20],
    });
  }
}

import PdfPrinter from "pdfmake";
import { FONTS } from "./constants";
import { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { generateSVGChart } from "./generateSVGChart";
import { generateHorizontalBarChart } from "./generateHorizontalBarChart";
import { analyzeChart, translateText } from "../services/ollamaServices";

const selectFontForLanguage = (language: string): string => {
  switch (language) {
    case "中文":
      return "NotoSC";
    case "日本語":
      return "NotoJP";
    case "한국어":
      return "NotoKR";
    default:
      return "Noto";
  }
};

class PDFBuilder {
  protected document: TDocumentDefinitions & { content: Content[] } = {
    content: [],
    defaultStyle: { font: "Noto" },
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
    this.document.defaultStyle = {
      font: selectFontForLanguage(language),
    };
  }

  // async addSVGChart(
  //   users: {
  //     label: string;
  //     percentage: number;
  //     color: string;
  //   }[]
  // ) {
  //   this.document.content.push({
  //     table: {
  //       widths: ["70%", "30%"],
  //       body: [
  //         [
  //           {
  //             svg: generateSVGChart(users),
  //             width: 250,
  //             height: 250,
  //             alignment: "center",
  //           },
  //           {
  //             stack: [
  //               {
  //                 text:
  //                   this.language === "English"
  //                     ? "Legend"
  //                     : await translateText("Legend", this.language),
  //                 fontSize: 16,
  //                 bold: true,
  //                 margin: [0, 0, 0, 10],
  //               },
  //               ...users.map((user) => ({
  //                 columns: [
  //                   {
  //                     canvas: [
  //                       {
  //                         type: "rect",
  //                         x: 0,
  //                         y: 0,
  //                         w: 15,
  //                         h: 15,
  //                         color: user.color,
  //                       },
  //                     ],
  //                     width: 20,
  //                   },
  //                   {
  //                     text: `${user.label}`,
  //                     margin: [5, 2, 0, 2],
  //                   },
  //                 ],
  //                 margin: [0, 2],
  //               })),
  //             ],
  //             margin: [20, 0, 0, 0],
  //           },
  //         ],
  //       ],
  //     },
  //     layout: "noBorders",
  //   });
  // }

  async addSVGChart(
    users: {
      label: string;
      percentage: number;
      color: string;
    }[]
  ) {
    const legendTitle: Content = {
      text:
        this.language === "English"
          ? "Legend"
          : await translateText("Legend", this.language),
      fontSize: 16,
      bold: true,
      margin: [0, 0, 0, 10],
    };

    const legendItems: Content[] = users.map(
      (user): Content => ({
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
            text: user.label,
            margin: [5, 2, 0, 2],
          },
        ],
        margin: [0, 2],
      })
    );

    const leftCell: TableCell = {
      svg: generateSVGChart(users),
      width: 250,
      height: 250,
      alignment: "center",
    };

    const rightCell: TableCell = {
      stack: [legendTitle, ...legendItems],
      margin: [20, 0, 0, 0],
    };

    const body: TableCell[][] = [[leftCell, rightCell]];

    this.document.content.push({
      table: {
        widths: ["70%", "30%"],
        body,
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
          text:
            this.language === "English"
              ? "Bar Chart"
              : await translateText("Bar Chart", this.language),
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
      text:
        this.language === "English"
          ? await analyzeChart(users)
          : await translateText(await analyzeChart(users), this.language),
      fontSize: 14,
      bold: true,
      alignment: "center",
      margin: [0, 10, 0, 20],
    });
  }
}

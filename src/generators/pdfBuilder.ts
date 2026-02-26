import PdfPrinter from "pdfmake";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { FONTS } from "../utils/constants";

export class PDFBuilder {
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

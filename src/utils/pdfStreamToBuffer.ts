export const pdfStreamToBuffer = (
  pdfDoc: PDFKit.PDFDocument
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", (err) => reject(err));

    pdfDoc.end();
  });

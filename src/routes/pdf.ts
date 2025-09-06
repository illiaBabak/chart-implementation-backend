import express, { Request, Response, text } from "express";
import {
  CHART_TYPES,
  CHART_TYPES_TO_GENERATE,
  SUPABASE_URL,
} from "../utils/constants";
import { ChartBuilder } from "../utils/generatePdf";
import { getUsers } from "../services/userServices";
import { segregateUsers } from "../utils/segregateUsers";
import {
  insertChart,
  getLatestVersionOfChartType,
  updateChart,
  uploadPdf,
  getChart,
  getCharts,
  deleteChart,
} from "../services/supabaseServices";
import { pdfStreamToBuffer } from "../utils/pdfStreamToBuffer";
import { isString, isStringArray } from "../utils/guards";
import { capitalize } from "../utils/capitalize";
import { translateText } from "../services/ollamaServices";

const arhiver = require("archiver");

const router = express.Router();

router.post("/generate-document", async (req: Request, res: Response) => {
  try {
    const { chartType, key } = req.body;

    if (!CHART_TYPES.includes(chartType) || !isString(key)) {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    const version = await getLatestVersionOfChartType(chartType);

    await insertChart({
      chart_type: chartType,
      status: "new",
      version: version + 1,
      key,
      url: null,
    });

    const users = await getUsers();

    const segregatedUsers = segregateUsers(users, chartType);

    const pdf = new ChartBuilder("English");

    pdf.setHeader({
      text: `User stats - ${capitalize(chartType)}, ${new Date(
        Date.now()
      ).toUTCString()}`,
      fontSize: 16,
      bold: true,
      alignment: "center",
      margin: [0, 10],
    });

    pdf.setFooter((currentPage: number) => {
      return {
        columns: [
          {
            text: "",
            width: "*",
          },
          {
            text: `Version ${version + 1}`,
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
    });

    await pdf.addSVGChart(segregatedUsers);
    await pdf.addHorizontalBarChart(segregatedUsers);

    const pdfDoc = pdf.saveDocument();

    if (!version) pdfDoc.pipe(res);

    const buffer = await pdfStreamToBuffer(pdfDoc);

    await uploadPdf(key, buffer);

    await updateChart(key, {
      status: "success",
      url: `${SUPABASE_URL}/storage/v1/object/public/documents/${key}.pdf`,
    });

    if (version) res.status(200).end();
  } catch (error) {
    const { key } = req.body;

    await updateChart(key, {
      status: "error",
      url: null,
    });

    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error on generate document" });
  }
});

router.post("/generate-archive", async (req: Request, res: Response) => {
  try {
    const { chartType, categories, language } = req.body;

    if (!isString(chartType) || !CHART_TYPES_TO_GENERATE.includes(chartType)) {
      res.status(400).json({ error: "Invalid chart type to generate" });
      return;
    }

    if (
      !isStringArray(categories) ||
      !categories.every((category: string) => CHART_TYPES.includes(category))
    ) {
      res.status(400).json({ error: "Invalid categories" });
      return;
    }

    if (!isString(language)) {
      res.status(400).json({ error: "Invalid language" });
      return;
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="charts-${chartType}-${Date.now()}.zip"`
    );

    const users = await getUsers();

    const zip = arhiver("zip", {
      zlib: { level: 5 },
    });

    // * Prepare data for translation
    const headersToTranslate: Record<string, string[]> = {};
    const labelsToTranslate: Record<string, string[]> = {};

    categories.forEach((category: string) => {
      // Headers
      headersToTranslate[category] = [
        `User stats - ${capitalize(category)}, ${new Date(
          Date.now()
        ).toUTCString()}`,
      ];

      // Labels
      const segregatedUsers = segregateUsers(users, category);
      labelsToTranslate[category] = segregatedUsers.map((u) => u.label);
    });

    // * Translate headers and labels
    const translatedHeaders = await translateText<Record<string, string[]>>(
      headersToTranslate,
      language
    );

    const translatedLabels = await translateText<Record<string, string[]>>(
      labelsToTranslate,
      language
    );

    // * All users for each category and map translated labels
    const allSegregatedUsers = categories.map((category: string) => {
      const segregatedUsers = segregateUsers(users, category);
      const categoryTranslatedLabels =
        translatedLabels[category] || labelsToTranslate[category];

      return {
        category,
        users: segregatedUsers.map((user, userIndex: number) => ({
          label: categoryTranslatedLabels[userIndex] || user.label,
          percentage: user.percentage,
          color: user.color,
        })),
      };
    });

    await Promise.all(
      allSegregatedUsers.map(
        async ({
          category,
          users,
        }: {
          category: string;
          users: { label: string; percentage: number; color: string }[];
        }) => {
          const pdf = new ChartBuilder(language);

          const categoryHeader =
            translatedHeaders[category]?.[0] ||
            headersToTranslate[category]?.[0] ||
            `User stats - ${capitalize(category)}`;

          pdf.setHeader({
            text: categoryHeader,
            fontSize: 16,
            bold: true,
            alignment: "center",
            margin: [0, 10],
          });

          pdf.setFooter((currentPage: number) => {
            return {
              columns: [
                {
                  text: "",
                  width: "*",
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
          });

          switch (chartType) {
            case "pie":
              await pdf.addSVGChart(users);
              break;
            case "bar":
              await pdf.addHorizontalBarChart(users);
              break;
            case "both":
              await pdf.addSVGChart(users);
              await pdf.addHorizontalBarChart(users);
              break;
          }

          await pdf.addChartAnalysis(users);

          const pdfDoc = pdf.saveDocument();

          const buffer = await pdfStreamToBuffer(pdfDoc);

          zip.append(buffer, { name: `${category}.pdf` });
        }
      )
    );

    zip.pipe(res);

    await zip.finalize();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Internal server error on generate archive" });
    }
  }
});

router.get("/get-documents", async (req: Request, res: Response) => {
  try {
    const chartType = req.query.chartType;

    if (!chartType) {
      res.status(400).json({ error: "Chart type is required" });
      return;
    }

    if (!isString(chartType)) {
      res.status(400).json({ error: "Chart type must be a string" });
      return;
    }

    if (!CHART_TYPES.includes(chartType)) {
      res.status(400).json({ error: "Invalid chart type" });
      return;
    }

    const charts = await getCharts(chartType);

    res.json(charts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error on get documents" });
  }
});

router.get("/get-document", async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (!isString(key)) {
      res.status(400).json({ error: "Key is required" });
      return;
    }

    const chart = await getChart(key);

    res.json(chart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error on get document" });
  }
});

router.delete("/delete-document", async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (!isString(key)) {
      res.status(400).json({ error: "Key is required" });
      return;
    }

    await deleteChart(key);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error on delete document" });
  }
});

export default router;

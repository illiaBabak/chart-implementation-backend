import express, { Request, Response } from "express";
import { CHART_TYPES, SUPABASE_URL } from "../utils/constants";
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
import { isString } from "../utils/guards";
import { capitalize } from "../utils/capitalize";

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

    const pdf = new ChartBuilder();

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

    pdf.addSVGChart(segregatedUsers);
    pdf.addHorizontalBarChart(segregatedUsers);

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

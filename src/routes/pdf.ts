import express, { Request, Response } from "express";
import { CHART_TYPES, SUPABASE_URL } from "../utils/constants";
import { generatePdf } from "../utils/generatePdf";
import { getUsers } from "../services/userServices";
import { segregateUsers } from "../utils/segregateUsers";
import { v4 as uuidv4 } from "uuid";
import {
  insertChart,
  getLatestVersionOfChartType,
  updateChart,
  uploadPdf,
  getChart,
  getCharts,
} from "../services/supabaseServices";
import { pdfStreamToBuffer } from "../utils/pdfStreamToBuffer";
import { isString } from "../utils/guards";

const router = express.Router();

router.post("/generate-document", async (req: Request, res: Response) => {
  const key = uuidv4();

  try {
    const { chartType } = req.body;

    if (!CHART_TYPES.includes(chartType)) {
      res.status(400).json({ error: "Invalid chart type" });
      return;
    }

    const version = await getLatestVersionOfChartType(chartType);

    await insertChart({
      chart_type: chartType,
      status: "new",
      version: (version ?? 0) + 1,
      key,
      url: null,
    });

    const users = await getUsers();

    const pdf = await generatePdf(segregateUsers(users, chartType));

    if (!version) pdf.pipe(res);

    const buffer = await pdfStreamToBuffer(pdf);

    await uploadPdf(key, buffer);

    await updateChart(key, {
      status: "success",
      url: `${SUPABASE_URL}/storage/v1/object/public/documents/${key}.pdf`,
    });

    if (version) res.status(200).end();
  } catch (error) {
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

export default router;

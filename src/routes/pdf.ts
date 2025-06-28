import express, { Request, Response } from "express";
import { CHART_TYPES } from "../utils/constants";
import { generatePdf } from "../utils/generatePdf";
import { getUsers } from "../services/userServices";
import { segregateUsers } from "../utils/segregateUsers";
import { v4 as uuidv4 } from "uuid";
import {
  insertChart,
  getLatestVersionOfChartType,
  updateChart,
  uploadPdf,
} from "../services/supabaseServices";
import { pdfStreamToBuffer } from "../utils/pdfStreamToBuffer";

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
      url: `${key}.pdf`,
    });
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

export default router;

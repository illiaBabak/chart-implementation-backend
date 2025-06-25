import express, { Request, Response } from "express";
import { CHART_TYPES } from "../utils/constants";
import { generatePdf } from "../utils/generatePdf";
import { getUsers } from "../services/userService";
import { segregateUsers } from "../utils/segregateUsers";

const router = express.Router();

router.post("/generate-document", async (req: Request, res: Response) => {
  try {
    const { chartType } = req.body;

    if (!CHART_TYPES.includes(chartType)) {
      res.status(400).json({ error: "Invalid chart type" });
      return;
    }

    const users = await getUsers();

    const pdf = await generatePdf(segregateUsers(users, chartType));

    pdf.pipe(res);
    pdf.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error on generate document" });
  }
});

export default router;

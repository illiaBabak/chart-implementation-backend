import express, { Request, Response } from "express";
import { getUsers } from "../services/userServices";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error in GET /users:", err);
    res.status(500).json({ error: "Internal server error on get users" });
  }
});

export default router;

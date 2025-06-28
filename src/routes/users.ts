import express from "express";
import { getUsers } from "../services/userServices";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error on get users" });
  }
});

export default router;

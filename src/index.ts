import express from "express";
import usersRouter from "./routes/users";
import pdfRouter from "./routes/pdf";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./utils/constants";

dotenv.config();

export const app = express();

export const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_KEY ?? "",
  {
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          duplex: "half",
        } as RequestInit);
      },
    },
  }
);

const allowedOrigins = [
  "http://localhost:3000",
  "https://chart-implementation-frontend-ikj5.vercel.app",
];

app.use(express.json());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/users", usersRouter);
app.use("/api/pdf", pdfRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import usersRouter from "./routes/users";
import cors from "cors";

export const app = express();

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import usersRouter from "./routes/users";
import cors from "cors";

export const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "https://chart-implementation-frontend-ikj5.vercel.app/",
    credentials: true,
  })
);

app.use("/users", usersRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

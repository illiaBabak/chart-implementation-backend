import express from "express";
import usersRouter from "./routes/users";
import cors from "cors";

export const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use("/users", usersRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

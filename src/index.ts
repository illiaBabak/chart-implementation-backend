import express from "express";
import usersRouter from "./routes/users";

const app = express();

app.use(express.json());

app.use("/users", usersRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

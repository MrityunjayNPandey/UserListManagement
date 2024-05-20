import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export default function connectToDB() {
  mongoose
    .connect(
      `${process.env.mongoURL}?authSource=admin&retryWrites=true&w=majority`
    )
    .then(() => {
      console.log(`DB connected`);
    });
}

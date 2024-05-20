import mongoose from "mongoose";

export default function connectToDB() {
  mongoose
    .connect("mongodb://localhost:27017/user_list_management")
    .then(() => {
      console.log(`DB connected`);
    });
}

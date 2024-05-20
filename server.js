import express from "express";
import connectToDB from "./mongooseConnect.js";
import { addUser } from "./functions/addUser.js";
import { addUsersViaCSV } from "./functions/addUsersViaCSV.js";

const app = express();

app.use(express.json());

const port = 3000;

connectToDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/addUser", async (req, res) => {
  const userDetails = req.body;

  try {
    await addUser(userDetails.name, userDetails.email, userDetails.city);
    res.json("User added!");
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
});

app.post("/addUsersViaCSV", async (req, res) => {
  try {
    const result = await addUsersViaCSV(req.file.path);
    if (errors.length > 0) {
      res.status(206).json("Unable to add some users: " + result);
    }
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
});

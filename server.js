import express from "express";
import multer from "multer";
import { addUser } from "./functions/addUser.js";
import { addUsersViaCSV } from "./functions/addUsersViaCSV.js";
import connectToDB from "./mongooseConnect.js";

const app = express();

app.use(express.json());

// Use the storage
const upload = multer({ dest: "tmp/csv/" });

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

app.post("/addUsersViaCSV", upload.single("file"), async (req, res) => {
  try {
    const result = await addUsersViaCSV(req.file.path);
    if (result.insertionErrors.length > 0) {
      res
        .status(206)
        .json("Unable to add some users: " + JSON.stringify(result));
    } else {
      res
        .status(200)
        .json("All users added successfully: " + JSON.stringify(result));
    }
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
});

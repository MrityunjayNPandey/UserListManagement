import express from "express";
import multer from "multer";
import { addUser } from "./functions/addUser.js";
import { addUsersViaCSV } from "./functions/addUsersViaCSV.js";
import { listUsers, listUsersByName } from "./functions/listUsers.js";
import connectToDB from "./mongooseConnect.js";

const app = express();

app.use(express.json());

//for storing csv file in lambda's tmp folder
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

const port = 3000;

connectToDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//lists all the users
app.get("/listUsers", async (req, res) => {
  try {
    const users = await listUsers();
    res.json(JSON.stringify(users));
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
});

//search by prefix
app.get("/listUsersByName", async (req, res) => {
  const { name } = req.body;

  try {
    const users = await listUsersByName(name);
    res.json(JSON.stringify(users));
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
});

//for adding a single user
app.post("/addUser", async (req, res) => {
  const userDetails = req.body;

  try {
    await addUser(userDetails.name, userDetails.email, userDetails.city);
    res.json("User added!");
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
});

//for adding users via CSV 
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

import csvParser from "csv-parser";
import { createReadStream } from "fs";
import { finished } from "stream/promises";
import stripBomStream from "strip-bom-stream";
import { User } from "../db/user.js";

function checkInvalidDocument(row, emailsInDBSet, emailsInCSVSet) {
  const nullVariables = [];

  if (!row.name) {
    nullVariables.push("name");
  }
  if (!row.email) {
    nullVariables.push("email");
  }

  let errorString = "";

  if (nullVariables.length > 0) {
    errorString += nullVariables.join(" ,");
    errorString += " does not exist";
  }

  if (row.email) {
    if (emailsInDBSet.has(row.email)) {
      if (errorString) {
        errorString += " and ";
      }
      errorString += "email already exists in DB";
    }
    if (emailsInCSVSet.has(row.email)) {
      if (errorString) {
        errorString += " and ";
      }
      errorString += "email already exists in CSV";
    }
  }

  return errorString;
}

export async function addUsersViaCSV(filePath) {
  const existingUsers = await User.find({}, { email: 1 });

  const existingUserEmails = existingUsers.map(({ email }) => email);

  const emailsInDBSet = new Set(existingUserEmails);
  const emailsInCSVSet = new Set();

  const validDocuments = []; //correct documents that can be created using insertMany

  const insertionErrors = []; //for informing user about what's wrong in his CSV(an array of strings informing error)

  let rowNumber = 0;

  //function to process a single row.
  const processRow = (row) => {
    rowNumber++;

    const invalidDocumentError = checkInvalidDocument(
      row,
      emailsInDBSet,
      emailsInCSVSet
    );

    if (invalidDocumentError === "") {
      validDocuments.push(row);
    } else {
      insertionErrors.push(
        `at row number ${rowNumber}: ${invalidDocumentError}`
      );
    }

    emailsInCSVSet.add(row.email);
  };

  const stream = createReadStream(filePath)
    .pipe(stripBomStream()) //to remove the BOM before parsing the CSV file
    .pipe(csvParser())
    .on("data", processRow);

  await finished(stream);

  await User.insertMany(validDocuments);

  return {
    insertionErrors: insertionErrors,
    addedUsers: validDocuments.length,
    notAddedUsers: insertionErrors.length,
    totalUsers: existingUserEmails.length + validDocuments.length,
  };
}

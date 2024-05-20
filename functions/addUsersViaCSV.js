import csvParser from "csv-parser";
import { createReadStream } from "fs";
import { User } from "../db/user.js";

function checkInvalidDocument(row, emailsInDBSet, emailsInCSVSet) {
  const nullVariables = [];

  if (!row.name) {
    nullVariables.push(row.name);
  }
  if (!row.email) {
    nullVariables.push(row.email);
  }

  const errorString = "";

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
  const emailsInCSVSet = new Set(existingUserEmails);

  const validDocuments = [];

  const errors = []; //for informing user about what's wrong in his CSV

  let rowNumber = 0;

  const processRow = (row) => {
    rowNumber++;

    const invalidDocumentError = checkInvalidDocument(
      row,
      emailsInDBSet,
      emailsInCSVSet
    );

    if (!invalidDocumentError) {
      validDocuments.push(row);
    } else {
      errors.push(`at row number ${rowNumber}: ${invalidDocumentError}`);
    }

    emailsInCSVSet.add(row.email);
  };

  createReadStream(filePath).pipe(csvParser()).on("data", processRow);

  await User.insertMany(validDocuments);

  return {
    errors,
    addedUsers: validDocuments.length,
    notAddedUsers: errors.length,
    totalUsers: existingUserEmails.length + validDocuments.length,
  };
}

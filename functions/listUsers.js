import { User } from "../db/user.js";

export async function listUsers() {
  return User.find({});
}

export async function listUsersByName(partialName) {
  return User.find({
    name: { $regex: new RegExp(`^${partialName}`), $options: "i" },
  });
}

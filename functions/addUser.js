import { User } from "../db/user.js";

export async function addUser(name, email, city) {
  await User.create({
    name: name,
    email: email,
    city: city,
  });

  return true;
}

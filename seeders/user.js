const bcrypt = require("bcryptjs");
const db = require("../config/db");

const seedData = [
  {
    id: "1",
    name: "Test 1",
    email: "test1@gmail.com",
    phone_number: "082173738990",
    role: "user",
    status: "active",
    password: "12345678",
  },
  {
    id: "2",
    name: "Test 2",
    email: "test2@gmail.com",
    phone_number: "082173738991",
    role: "user",
    status: "active",
    password: "12345678",
  },
  {
    id: "3",
    name: "Test 3",
    email: "test3@gmail.com",
    phone_number: "082173738992",
    role: "user",
    status: "active",
    password: "12345678",
  },
  {
    id: "4",
    name: "Test 4",
    email: "test4@gmail.com",
    phone_number: "082173738993",
    role: "admin",
    status: "active",
    password: "12345678",
  },
  {
    id: "5",
    name: "Test 5",
    email: "test5@gmail.com",
    phone_number: "082173738994",
    role: "admin",
    status: "active",
    password: "12345678",
  },
];

async function seed() {
  await db.promise().beginTransaction();

  try {
    const salt = await bcrypt.genSalt(10);

    for (const data of seedData) {
      const encryptedPassword = await bcrypt.hash(data.password, salt);

      await db
        .promise()
        .query(
          "INSERT INTO `users`(`name`, `email`, `phone_number`, `role`, `status`, `password`) VALUES (?,?,?,?,?,?)",
          [
            data.name,
            data.email,
            data.phone_number,
            data.role,
            data.status,
            encryptedPassword,
          ]
        );
    }

    await db.promise().commit();
    console.log('Seeder "User" executed successfully!');
  } catch (error) {
    await db.promise().rollback();
    console.error("Error in seeder:", error);
  }
}

module.exports = {
  seed,
};

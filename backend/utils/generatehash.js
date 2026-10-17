// To generate hash function for admin

require("dotenv").config();

const { hashPassword } = require("./passwordUtils");

async function main() {
  const hash = await hashPassword("Admin@123");
  console.log(hash);
}

main();

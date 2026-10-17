const bcrypt = require("bcrypt");

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function getFirstName(name) {
  return name.trim().split(/\s+/)[0];
}

module.exports = {
  hashPassword,
  comparePassword,
  getFirstName,
};

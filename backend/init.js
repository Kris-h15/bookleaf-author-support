// To initialize/Reinitialize the database (init.js)

require("dotenv").config();
// function to convert given data into password
const { hashPassword, getFirstName } = require("./utils/passwordUtils");

const connectDB = require("./config/db");
const Author = require("./models/Author");
const Book = require("./models/Book");
const Ticket = require("./models/Ticket");

// Sample dataset
const data = require("./data/sample_1.json");

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear old sample records before reinitializing DB
    await Author.deleteMany({});
    await Book.deleteMany({});
    await Ticket.deleteMany({});

    // Create authors without their nested books
    const authorRecords = await Promise.all(
      data.authors.map(async (author) => ({
        author_id: author.author_id,
        photoUrl: author.photoUrl,
        name: author.name,
        email: author.email,
        phone: author.phone,
        city: author.city,
        joined_date: author.joined_date,
        password: await hashPassword(getFirstName(author.name).toLowerCase()),
      })),
    );

    const savedAuthors = await Author.insertMany(authorRecords);

    // Map each original author ID to its MongoDB document ID
    const authorMap = new Map(
      savedAuthors.map((author) => [author.author_id, author._id]),
    );

    // Flatten all nested books into one array (basically .map .flat)
    const bookRecords = data.authors.flatMap((author) =>
      author.books.map((book) => ({
        ...book,
        author_id: author.author_id,
        author: authorMap.get(author.author_id),
      })),
    );

    await Book.insertMany(bookRecords);

    console.log(`Seeded ${savedAuthors.length} authors`);
    console.log(`Seeded ${bookRecords.length} books`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();

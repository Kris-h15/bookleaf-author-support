// js code to connect to our mongoDb Atlas database using connection string

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "BookLeafPortal",
    });
    console.log("MongoDb connection Successfull");
  } catch (error) {
    console.log("MongoDB connection failed:", error);
    throw error;
  }
};

module.exports = connectDB;

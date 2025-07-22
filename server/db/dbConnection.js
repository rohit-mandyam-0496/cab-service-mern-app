const mongoose = require("mongoose");
const dotEnv = require("dotenv");
dotEnv.config();

const connectionURL = process.env.CONNECTION_STRING;

const dbConnect = async () => {
  try {
    await mongoose
      .connect(connectionURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Connected to Database!!");
      })
      .catch((error) => {
        console.log("Error connecting to Database:", error);
      });
      mongoose.set("debug", { color: true });
  } catch (error) {
    console.log("DB not Connected " + error);
  }
};

module.exports = dbConnect;

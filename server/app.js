const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dotEnv = require("dotenv");
dotEnv.config();

const middlewares = require("./middleware/common/index");
middlewares(app);

const dbConnection = require("./db/dbConnection");
dbConnection();

//------------ Routes ------------//
app.use("/api/v1", require("./routes/index"));

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

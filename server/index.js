const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors())

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

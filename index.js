import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("running well too");
  console.log("on the runn");
});

app.listen(1234, () => {
  console.log("server running");
});

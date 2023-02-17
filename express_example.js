// define dependencies
const express = require("express");
const app = express();
const fs = require("fs");

const port = 8000;

// listen to a port
app.listen(port, function () {
  console.log(`Server is listening on port ${port}.`);
});

// handle requests with routes

app.get("/hello", function (req, res) {
  res.send("hi there!");
});

app.get("/goodbye", function (req, res) {
  res.send("bye now!");
});

app.get("/pets", (req, res, next) => {
  fs.readFile("pets.json", "utf8", function (error, data) {
    res.json({ message: `${data}` });
    //res.send(data);
  });
});

app.get("/pets/:num", (req, res, next) => {
  let num = req.params.num;
  if (!Number(num)) {
    next({ status: 400, message: "Please enter a number after /pets/" });
  } else {
    fs.readFile("pets.json", "utf8", function (error, data) {
      num = Number(num) - 1;
      data = JSON.parse(data);
      if (num >= data.length) {
        //prettier-ignore
        next({ status: 400, message: `Please enter a number after /pets/ that is less than ${data.length}` });
      } else {
        res.json({ message: `${JSON.stringify(data[num])}` });
        //res.send(data[num]);
      }
    });
  }
});

// if an error occured
app.use((err, req, res, next) => {
  res.status(err.status).json({ error: err });
});

// if requested handle does not exist -- keep at bottom
app.use((req, res, next) => {
  // res.send("Not Found!");   // Only sends one or the other, not both
  res.status(404).json({ error: { message: "Not Found" } });
});

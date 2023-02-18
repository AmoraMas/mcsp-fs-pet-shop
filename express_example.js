// NOTE:
// npm install --save express

// NOTE:
// Postman POST request should have a Body / raw / JSON object similar to below
// Must use double quotes ""  and NOT single quotes ''
//    {"age":3, "kind":"parakeet", "name":"Cornflake"}

// define dependencies
const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());

const port = 8000;

// listen to a port
app.listen(port, function () {
  console.log(`Server is listening on port ${port}.`);
});

// handle requests with routes
// return all entries
app.get("/pets/", (req, res, next) => {
  fs.readFile("pets.json", "utf8", function (error, data) {
    res.json({ message: `${data}` });
    //res.send(data);
  });
});

// retun only requested entry
app.get("/pets/:num", (req, res, next) => {
  let num = req.params.num;
  if (!Number(num) && num != "0") {
    next({ status: 404, message: "Please enter a number after /pets/" });
  } else {
    fs.readFile("pets.json", "utf8", function (error, data) {
      num = parseInt(num);
      data = JSON.parse(data);
      if (num < 0 || num >= data.length) {
        //prettier-ignore
        next({ status: 404, message: `Please enter a number after /pets/ that is greater than 0 and less than ${data.length}` });
      } else {
        res.json({ message: `${JSON.stringify(data[num])}` });
        //res.send(data[num]);
      }
    });
  }
});

// Adds entry into file  -- Doesn't work
//app.post("/pets/:age/:kind/:name", (req, res, next) => {
app.post("/petz", (req, res, next) => {
  //console.log("req: ", req);
  console.log("req.body: ", req.body);
  if (
    !Number(req.body.age) ||
    req.body.kind == undefined ||
    req.body.name == undefined
  ) {
    //prettier-ignore
    next({ status: 404, message: `Submitted information was incorrect. Please submit /pets/age/kind/name.` });
  } else {
    let newPet = {
      age: req.body.age,
      kind: req.body.kind,
      name: req.body.name,
    };
    fs.readFile("pets.json", "utf8", function (error, data) {
      data = JSON.parse(data);
      data.push(newPet);
      data = JSON.stringify(data);
      fs.writeFile("pets.json", data, function (error) {
        if (error) {
          // prettier-ignore
          next({ status: 400, message: `Error Writing to file` });
        } else {
          res.json({ message: `${JSON.stringify(newPet)}` });
        }
      });
    });
  }
});

// if an error occured  -- Keep next to last
app.use((err, req, res, next) => {
  //console.error("Error Stack: ", err.stack);
  res.status(err.status).send({ error: err });
});

// if requested handle does not exist -- keep last
app.use((req, res, next) => {
  // res.status(404).send("Not Found!");   // Only sends one or the other, not both
  res.status(500).json({ error: { message: `Path Not Found: ${req.url}` } });
});

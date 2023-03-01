// NOTE:
// npm install --save express

// NOTE:
// Postman POST request should have a Body / raw / JSON object similar to below
// Must use double quotes ""  and NOT single quotes ''
//    {"age":3, "kind":"parakeet", "name":"Cornflake"}

// define dependencies
const fs = require("fs");
const express = require("express");
const app = express();
app.use(express.json());

//const path = require('path');
//const petsPath = path.join(__dirname, 'pets.json');

const port = 8000;

// listen to a port
app.listen(port, function () {
  console.log(`Server is listening on port ${port}.`);
});

// handle requests with routes

// test request
app.get("/test", (req, res, next) => {
  res.send('The world is so awesome!');
})

// return all entries
app.get("/pets", (req, res, next) => {
  fs.readFile("pets.json", "utf8", function (error, data) {
    //res.json({ message: `${data}` });
    data = JSON.parse(data);
    res.send(data);
  });
});

// retun only the requested entry
app.get("/pets/:petID", (req, res, next) => {
  let petID = parseInt(req.params.petID);
    if (!Number.isInteger(petID)) {
    return next({ status: 404, message: "Please enter a number after /pets/" });
  }
  fs.readFile("pets.json", "utf8", function (error, data) {
    data = JSON.parse(data);
    if (petID < 0 || petID >= data.length) {
      return next({ status: 404, message: `Please enter a number after /pets/ that is greater than 0 and less than ${data.length}` });
    } else {
      //res.json({ message: `${JSON.stringify(data[num])}` });
      res.send(data[petID]);
    }
  });
});

// Adds entry into file
app.post("/pets", (req, res, next) => {
  const age = parseInt(req.body.age);
  const { kind, name } = req.body;
  if ( !age || !kind || !name || !Number(age) ) {
    return next({ status: 404, message: `Submitted information was incorrect. Please include age, kind, and name.` });
  }
  let newPet = { age, kind, name };
  fs.readFile("pets.json", "utf8", function (readError, data) {
    if (readError) {
      return next(readError);
    }
    // Adjust the data
    data = JSON.parse(data);
    data.push(newPet);
    data = JSON.stringify(data);
    // Write the data back to the file
    fs.writeFile("pets.json", data, function (writeError) {
      if (writeError) {
        next({ status: 400, message: `Error Writing to file` });
      } else {
        res.json({ message: `${JSON.stringify(newPet)}` });
      }
    });
  });
});

// Changes/replaces an entry into file
app.put("/pets/:petID", (req, res, next) => {
  const petID = parseInt(req.params.petID);
  const age = Number.parseInt(req.body.age);
  const { kind, name } = req.body;
  if ( !age || !kind || !name || !Number(age) ) {
    return next({ status: 404, message: `Submitted information was incorrect. Please include age, kind, and name.` });
  }
  let newPet = { age, kind, name };
  fs.readFile("pets.json", "utf8", function (readError, data) {
    if (readError) {
      return next(readError);
    }
    // Adjust the data
    data = JSON.parse(data);
    data.splice(petID, 1, newPet);
    data = JSON.stringify(data);
    // Write the data back to the file
    fs.writeFile("pets.json", data, function (writeError) {
      if (writeError) {
        return next({ status: 400, message: `Error Writing to file` });
      } else {
        res.json({ message: `${JSON.stringify(newPet)}` });
      }
    });
  });
});

// Changes/replaces only the given information
app.patch("/pets/:petID", (req, res, next) => {
  const petID = parseInt(req.params.petID);
  const request = req.body;
  fs.readFile("pets.json", "utf8", function (readError, data) {
    if (readError) {
      return next({ status: 400, message: readError});
    }
    // Adjust the data
    data = JSON.parse(data);
    for (let key in request){
      //console.log('key: ', key, ' value: ', request[key]);
      if (key == 'age' || key == 'name' || key == 'kind') {
        if (key == 'age' && !Number(request[key])) {
          return next({stutus: 400, message: `Submitted age is not a number.`})
        }
        data[petID][key] = request[key];
      }
      else {
        return next({status: 400, message: `Request was bad. Can only change "age", "kind", and/or "name"`})
      }
    }
    data = JSON.stringify(data);
    // Write the data back to the file
    fs.writeFile("pets.json", data, function (writeError) {
      if (writeError) {
        return next({ status: 400, message: `Error Writing to file` });
      } else {
        //res.json({ message: `${JSON.stringify(newPet)}` });
        res.json({ message: `Updated /pets/${JSON.stringify(petID)}` });
      }
    });
  });
});

// Deletes an entry from the file
app.delete("/pets/:petID", (req, res, next) => {
  const petID = parseInt(req.params.petID);
  fs.readFile("pets.json", "utf8", function (readError, data) {
    if (readError) {
      return next({ status: 400, message: readError});
    }
    // Adjust the data
    data = JSON.parse(data);
    if (data[petID]) {
      data.splice (petID, 1);
    }
    else {
      return next({status: 404, message: `/pets/${petID} does not exist. Cannot delete` });
    }
    data = JSON.stringify(data);
    // Write the data back to the file
    fs.writeFile("pets.json", data, function (writeError) {
      if (writeError) {
        return next({ status: 400, message: `Error Writing to file` });
      } else {
        //res.json({ message: `${JSON.stringify(newPet)}` });
        res.json({ message: `Deleted /pets/${JSON.stringify(petID)}` });
      }
    });
  });
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

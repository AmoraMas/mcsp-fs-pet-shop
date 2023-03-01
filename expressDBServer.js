// NOTE:
// npm install --save express

// NOTE:
// Postman POST request should have a Body / raw / JSON object similar to below
// Must use double quotes ""  and NOT single quotes ''
//    {"age":3, "kind":"parakeet", "name":"Cornflake"}

// define dependencies
const { Pool } = require("pg");
const express = require("express");
const app = express();
app.use(express.json());

//const path = require('path');
//const petsPath = path.join(__dirname, 'pets.json');

const port = 8000;

const pool = new Pool ({
  user: 'postgres',
  host: 'localhost',
  database: 'petshop',
  password: 'password',
  port: 6543
});


// listen to a port
app.listen(port, function () {
  console.log(`Server is listening on port ${port}.`);
});

// handle requests with routes

// test request
app.get("/test", (req, res, next) => {
  res.send('Programming is so awesome!');
})

// return all pets entries
app.get("/pets", (req, res, next) => {
  const result = pool.query('SELECT (id, name, kind_id, age) FROM pets;', (err, data) => {
    if (err) {
      return next ({ status: 500, message: err });
    }
    res.send(data.rows);
  })
});

// retun only the requested pets entry
app.get("/pets/:petID", (req, res, next) => {
  let petID = parseInt(req.params.petID);
    if (!Number.isInteger(petID)) {
    return next({ status: 404, message: "Please enter a number after /pets/" });
  }
  const result = pool.query(`SELECT (id, name, kind_id, age) FROM pets WHERE id = $1;`, [petID], (err, data) => {
    if (err) {
      return next({ status: 500, message: err});
    }
    else if (data.rowCount == 0) {
      return next({ status: 404, message: `Please enter a valid pet id after /pets/` });
    }
    else {
      res.send(data.rows[0]);
    }
  });
});

// return all kinds entries
app.get("/kinds", (req, res, next) => {
  const result = pool.query('SELECT (id, kind) FROM kinds;', (err, data) => {
    if (err) {
      return next ({ status: 500, message: err });
    }
    res.send(data.rows);
  })
});

// retun only the requested pets entry
app.get("/kinds/:kindID", (req, res, next) => {
  let kindID = parseInt(req.params.kindID);
    if (!Number.isInteger(kindID)) {
    return next({ status: 404, message: "Please enter a number after /kinds/" });
  }
  const result = pool.query(`SELECT (id, kind) FROM kinds WHERE id = $1;`, [kindID], (err, data) => {
    if (err) {
      return next({ status: 500, message: err});
    }
    else if (data.rowCount == 0) {
      return next({ status: 404, message: `Please enter a valid kind id after /kinds/` });
    }
    else {
      res.send(data.rows[0]);
    }
  });
});

// Adds a new pets entry
app.post("/pets", (req, res, next) => {
  const age = parseInt(req.body.age);
  const { kind, name } = req.body;
  if ( !age || !kind || !name || !Number(age) ) {
    return next({ status: 400, message: `Submitted information was incorrect. Please include age, kind, and name.` });
  }
  // Reads
  const result = pool.query(`SELECT (id) FROM kinds WHERE kind = $1;`, [kind], (readError, data) => {
    if (readError) {
      return next({ status: 500, message: readError});
    }
    else {
      if (data.rowCount == 0) {
        return next({ status: 404, message: `Kind does not exist. Create it using POST /kinds/:kind`});
      }
      else {
        let kind_id = data.rows[0].id;

        // Write the data back to the file
        //console.log('name:', name, ' kind_id:', kind_id, ' age:', age);
        const result = pool.query(`INSERT INTO pets (name, kind_id, age) VALUES ($1, $2, $3);`, [name, kind_id, age], (writeError, data) => {
          if (writeError) {
            next({ status: 400, message: `Error Writing to file` });
          }
          else {
            //console.log('data; ', data);
            res.send('Success');
          }
        });
      }
    };
  });
});

//Adds a new kinds entry
app.post("/kinds/:kind", (req, res, next) => {
  let kind = req.params.kind;
  const result = pool.query(`SELECT (id, kind) FROM kinds WHERE kind = $1;`, [kind], (readError, data) => {
    if (readError) {
      return next({ status: 500, message: readError});
    }
    else {
      if (data.rowCount == 1) {
        return next({status: 400, message: `Kind already exists: ${data.rows[0]}`});
      }
      else {
        const result = pool.query(`INSERT INTO kinds (kind) VALUES ($1);`, [kind], (writeError, data) => {
          if (writeError) {
            next({ status: 500, message: writeError });
          }
          else {
            const result = pool.query(`SELECT (id, kind) FROM kinds WHERE kind = $1;`, [kind], (readError, data) => {
              if (readError) {
                return next({ status: 500, message: readError});
              }
              return res.send(`Success, Added ${data.rows[0]}`);
            });
          }
        });
      }
    }
  });
});

// Changes/replaces only the given information
app.patch("/pets/:petID", (req, res, next) => {
  const petID = parseInt(req.params.petID);
  const request = req.body;

  const result = pool.query(`SELECT (id, name, kind_id, age) FROM pets WHERE id = $1;`, [petID], (readError, data) => {
    if (readError) {
      return next({ status: 500, message: readError});
    }
    else if (data.rowCount == 0) {
      return next({status: 404, message: `${petID} does not exist. Try again.`});
    }
    else {
      // for loop allows for changing more than one value at a time
      for (let key in request){
        console.log('key: ', key, ' value: ', request[key], ' petID: ', petID);
        if (key == 'age' && !Number(request[key])) {
          return next({stutus: 400, message: `Submitted age is not a number.`})
        }
        else if (key == 'age') {
          const result = pool.query(`UPDATE pets SET age=$1 WHERE id = $2;`, [request[key], petID], (writeError, data)=> {
            if (writeError) {
              return next({status: 500, message: writeError});
            }
          });
        }
        else if (key == 'name') {
          const result = pool.query(`UPDATE pets SET name=$1 WHERE id = $2;`, [request[key], petID], (writeError, data)=> {
            if (writeError) {
              return next({status: 500, message: writeError});
            }
          });
        }
        else if (key == 'kind') {
          const result = pool.query(`SELECT (id) FROM kinds WHERE kind = $1;`, [request[key]], (readError, data) => {
            if (readError) {
              return next({ status: 500, message: readError});
            }
            else {
              console.log('kind_id:', data.rows[0].id);
              const result = pool.query(`UPDATE pets SET kind_id=$1 WHERE id = $2;`, [data.rows[0].id, petID], (writeError, data) => {
                if (writeError) {
                  return next({status: 500, message: writeError});
                }
              });
            }
          });
        }
        else {
          return next({status: 400, message: `Request was bad. Can only change "age", "kind", and/or "name"`})
        }
      }
      const result = pool.query(`SELECT (id, name, kind_id, age) FROM pets WHERE id = $1;`, [petID], (readError, data) => {
        res.send(`Updated ${data.rows[0].row}`);
      });
    }
  });
});

// Deletes an entry from the file
app.delete("/pets/:petID", (req, res, next) => {
  const petID = parseInt(req.params.petID);
  const result = pool.query(`SELECT (id, name, kind_id, age) FROM pets WHERE id = $1;`, [petID], (readError, data) => {
  if (readError) {
    return next({ status: 500, message: readError});
  }
  // Adjust the data

  if (data.rowCount == 0) {
    return next({status: 404, message: `Pet with ID ${petID} does not exist.`});
  }
  else {
    //console.log('deleted pet: ', data);
    let deletedPet = data.rows[0].row;
    
    // Write the data back to the file
    const result = pool.query(`DELETE FROM pets WHERE id = $1;`, [petID], (writeError, data) => {
      if (writeError) {
        return next({ status: 500, message: writeError });
      }
      else {
        res.send(`Deleted: ${deletedPet}`);
      }
    });
  }
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

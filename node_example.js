const fs = require("fs"); // add this to the top of your js file
const http = require("http");
//const process = require('node:process'); // allow for program exit

const port = 8000;

let runningArg = process.argv[2];

const server = http.createServer((request, response) => {
  console.log("request", "recieved request");
  const url = request.url;
  const method = request.method;

  console.log("url: ", url);
  if (method === "GET") {
    if (url == "/") {
      //console.error(new Error('No argument provided.\nUsage: node pets.js [read | create | update | destroy]'));
      let reply =
        "No argument provided.\nUsage: node pets.js [read | create | update | destroy]";
      response.setHeader("Content-Type", "application/json");
      response.statusCode = 404;
      response.end(JSON.stringify(reply));
      return;
      //process.exitCode = 1;
    } else if (url.startsWith("/pets")) {
      fs.readFile("pets.json", "utf8", function (error, data) {
        //let index = parseInt(process.argv[3]);
        let index = parseInt(url.slice(6));
        console.log("index: ", index);
        data = JSON.parse(data);
        if (error) {
          //console.error(new Error('Incorrect read usage.\nUsage: node pets.js read INDEX'));
          //console.error(new Error(error));
          let reply = "Incorrect read usage.\nUsage: node pets.js read INDEX";
          response.setHeader("Content-Type", "application/json");
          response.statusCode = 404;
          response.end(JSON.stringify(reply));
          return;
          //process.exitCode = 1;
        } else if (isNaN(index)) {
          //console.error(new Error("Non-existant or incorrect index. \n Usage: node pets.js read INDEX"));
          //console.error(new Error(error));
          let reply =
            "Non-existant or incorrect index. \n Usage: node pets.js read INDEX";
          response.setHeader("Content-Type", "application/json");
          response.statusCode = 404;
          response.end(JSON.stringify(reply));
          //process.exitCode = 1;
        } else if (index < 0 || index > data.length - 1) {
          //console.error(new Error("Out-of-bound index. \n Usage: node pets.js read INDEX"));
          //console.error(new Error(error));
          let reply = "Out-of-bound index. \n Usage: node pets.js read INDEX";
          response.setHeader("Content-Type", "application/json");
          response.statusCode = 404;
          response.end(JSON.stringify(reply));
          //process.exitCode = 1;
        } else {
          //console.log('Data: ', data[index]);
          response.setHeader("Content-Type", "application/json");
          response.statusCode = 200;
          response.end(JSON.stringify(data[index]));
        }
      });
    }
  } else if (method === "POST") {
    let body = "";
    request.on("data", (data) => {
      body += data.toString(); // doesn't work yet
    });
    request.on("end", () => {
      console.log(body);
      response.setHeader("Content-Type", "application/json");
      response.statusCode = 200;
      response.end("Recieved: ", body);
    });
  } else if (runningArg == "create") {
    let age = parseInt(process.argv[3]);
    let kind = process.argv[4];
    let name = process.argv[5];

    if (age == undefined || name == undefined || kind == undefined) {
      console.error(
        new Error(
          "Did not provide required information \n Usage: node pets.js create AGE KIND NAME"
        )
      );
      exit(1);
    } else {
      fs.readFile("pets.json", "utf8", function (error, data) {
        data = JSON.parse(data);
        let writeObj = {
          age: age,
          kind: kind,
          name: name,
        };
        data.push(writeObj);
        fs.writeFile("pets.json", JSON.stringify(data), function (error) {
          if (error) {
            console.log(error);
          } else {
            console.log("Saved File!");
          }
        });
      });
    }
  } else if (runningArg == "update") {
  } else if (runningArg == "destroy") {
  } else {
    console.error(
      new Error(
        "Bad argument provided.\nUsage: node pets.js [read | create | update | destroy]"
      )
    );
    process.exitCode = 1;
  }
});

server.listen(port, function () {
  console.log("Listening on port", port);
});

//GET = Get some data
//POST = Create some data
//PATCH / PUT = Update existing data
//DELETE = Remove some data

//PUT and POST are similar but they both update data. The difference is PUT is a technique of altering resources when the client transmits data that revamps the whole resource. PATCH is a technique for transforming the resources when the client transmits partial data that will be updated without changing the whole data.

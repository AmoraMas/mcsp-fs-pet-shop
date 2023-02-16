const fs = require('fs');
const http = require('http');

const port = 8000;

const server = http.createServer((request, response) => {
    console.log("request", "recieved request");
    const url = request.url;
    const method = request.method;

    console.log('URL: ', url);

    if (url == "/pets") {
        fs.readFile("./pets.json", "utf8", function (err, data) {
            if (err) {

                return;
            }
            const allPets = JSON.parse(data);
            console.log("allPets: ", allPets);
            response.setHeader('Content-Type', 'application/json');
            response.statusCode = 200;
            response.end(JSON.stringify(allPets));
        });
    }

})

server.listen(port, function () {
    console.log('Listening on port', port);
});
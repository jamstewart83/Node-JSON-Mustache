var http = require('http'),
    url = require('url'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    mu = require('mu2');

mu.root = process.cwd() + '/templates';


var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

http.createServer(function (req, res) {
    "use strict";

    var uri = url.parse(req.url).pathname,
        filename = path.join(process.cwd(), uri),
        mimeType = mimeTypes[path.extname(filename).split(".")[1]];

    if(mimeType === "text/html") {
        var template = uri.replace("/",""),
            data = path.join(process.cwd(), "/data/" + template.replace(".html", ".json"));
        fs.exists(data, function (exists) {
            if (!exists) {
                console.log("not exists: " + filename);
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                res.end();
                return;
            }

            fs.readFile(data, function (err, data) {
                var stream = mu.compileAndRender(uri.replace("/", ""), JSON.parse(data));
                util.pump(stream, res);
            });
        });
    } else {

        fs.exists(filename, function (exists) {
            if (!exists) {
                console.log("not exists: " + filename);
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                res.end();
                return;
            }

            res.writeHead(200, mimeType);

            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);

        }); //end path.exists
    }
}).listen(1337);
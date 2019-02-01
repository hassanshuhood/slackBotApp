var express = require('express');
var bodyParser = require('body-parser');
var debug = require('debug')('botkit:webserver');

const fs = require('fs')
const https = require('https')
const service = require('./service.js');
module.exports = function(controller) {


    var webserver = express();
    var options = {
       key: fs.readFileSync(__dirname+"/cert/slc13rei.us.oracle.com.key"),
       cert: fs.readFileSync(__dirname+"/cert/slc13rei.us.oracle.com.crt")
    };
    service(webserver,controller);
    https.createServer(options, webserver).listen(3005, () => {
       console.log("Application starts listening on: " + 3005);

    });

    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    webserver.use(express.static('public'));


    webserver.listen(process.env.PORT || 3003, null, function() {

        debug('Express webserver configured and listening at http://localhost:' + process.env.PORT || 3000);

    });


    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require("path").join(__dirname, "routes");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      require("./routes/" + file)(webserver, controller);
    });

    controller.webserver = webserver;

    return webserver;

}

import * as React from "react"
import * as ReactDOM from "react-dom/server"
import {match, RouterContext} from "react-router"
import routes from "./routes"
import http from "http";
import express from "express";

function createApp() {
    const app = express()
    app.use(require("compression")())
    app.use('/public', express.static('public'));

    app.use(function (req, res, next) {
        require('./server')(req, res, next);
    });

    app.get("*", (req, res) => match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
        if (error) {
            res.status(500).send(error.message)
        } else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search)
        } else if (renderProps) {
            const index = <html>
            <head>
                <meta charSet="UTF-8"/>
                <title>Boilerplate</title>
            </head>

            <body>
            <div id="app">
                <RouterContext {...renderProps} />
            </div>
            <script src="/public/bundle.js"></script>
            </body>
            </html>
            res.status(200).send("<!DOCTYPE html>" + ReactDOM.renderToStaticMarkup(index))
        } else {
            res.status(404).send("Not found")
        }
    }))
    return app;
}

const server = http.createServer();
var app;
server.on("request", app = createApp());
server.listen(8080, function (err) {
    if (err) throw err;
    var addr = server.address();
    console.log("Listening at http://%s:%d", "localhost", addr.port);
});
if (module.hot) {
    module.hot.accept("./server", function () {
        console.log("Reloading");
        server.removeListener("request", app)
        server.on("request", app = createApp());
    })
}

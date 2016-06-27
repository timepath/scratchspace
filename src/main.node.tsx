import * as http from "http"
import * as express from "express"
import {Request, Response, NextFunction} from "express"
import * as webpack from "webpack"
import * as React from "react"
import * as ReactDOM from "react-dom/server"
import {match, RouterContext} from "react-router"
import MatchState = ReactRouter.MatchState
import routes from "./routes"

const PORT = 8080
const BROWSER_SYNC = true

function main():express.Application {
    const api = function (req:Request, res:Response, next:NextFunction) {
        require("./server")(req, res, next)
    }
    const ssr = (req:Request, res:Response) => match({
        routes,
        location: req.url
    }, (error:any, nextLocation:HistoryModule.Location, nextState:MatchState) => {
        if (error) {
            res.status(500).send(error.message)
        } else if (nextLocation) {
            res.redirect(302, nextLocation.pathname + nextLocation.search)
        } else if (nextState) {
            const index = <html>
            <head>
                <meta charSet="UTF-8"/>
                <title>Boilerplate</title>
            </head>
            <body>
            <div id="app">
                {React.createElement(RouterContext, nextState as any)}
            </div>
            <script src="/browser.js"></script>
            </body>
            </html>
            res.status(200).send("<!DOCTYPE html>" + ReactDOM.renderToStaticMarkup(index))
        } else {
            res.status(404).send("Not found")
        }
    })
    const bundler = (global as any)["bundler"] as webpack.compiler.Compiler
    const webpackConfig = bundler.options
    const middleware = [] as ((req:Request, res:Response, next:NextFunction) => any)[]
    middleware.push(require("compression")())
    middleware.push(api)
    middleware.push(require("webpack-dev-middleware")(bundler, {
        publicPath: webpackConfig.output.publicPath,
        stats: (webpackConfig as any).stats
    }))
    middleware.push(require("webpack-hot-middleware")(bundler))
    const express = require("express")
    const mode = {path: "src"}
    middleware.push(express.static(mode.path))
    middleware.push(require("express-history-api-fallback")("index.html", {root: mode.path}))

    app = express()
    middleware.forEach(function (it) {
        app.use(it)
    })
    app.get("*", ssr)
    return app
}
const server = http.createServer()
let app = main()
server.on("request", app)
server.listen(PORT - (BROWSER_SYNC ? 1 : 0), "localhost", function (err:any) {
    if (err) {
        throw err
    }
    const addr = server.address()
    console.log("Listening at http://%s:%d", "localhost", addr.port)
})

if (BROWSER_SYNC) {
    const bs = (() => require("browser-sync"))().create()
    bs.init({
        notify: false,
        open: false,
        port: PORT,
        proxy: {target: "http://localhost:" + (PORT - 1), ws: true},
        reloadOnRestart: true,
        tunnel: true, // bool | string
        ui: {port: (PORT + 1)},
        xip: true // vhost support
    })
}

const hot = (module as any).hot
if (hot) {
    hot.accept("./server", function () {
        console.log("Reloading")
        server.removeListener("request", app)
        server.on("request", app = main())
    })
    hot.decline()
}

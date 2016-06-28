import * as express from "express"
import {Request, Response, NextFunction} from "express"
import * as webpack from "webpack"
import * as React from "react"
import * as ReactDOM from "react-dom/server"
import {match, RouterContext} from "react-router"
import MatchState = ReactRouter.MatchState
import routes from "../routes"

function main():express.Application {
    const api = function (req:Request, res:Response, next:NextFunction) {
        require("./index.tsx").default(req, res, next)
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

    const app = express()
    middleware.forEach(function (it) {
        app.use(it)
    })
    app.get("*", ssr)
    return app
}

export default main()

const hot = (module as any).hot
if (hot) {
    hot.accept()
}

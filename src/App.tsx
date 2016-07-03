import * as React from "react"
import * as ReactRouter from "react-router"
const history = ReactRouter.browserHistory
import routes from "./routes"

import "./App.css"

export default (h = history) =>
    <ReactRouter.Router history={h}>{routes}</ReactRouter.Router>

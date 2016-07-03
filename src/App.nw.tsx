import App from "./App.tsx"
import * as ReactRouter from "react-router"
export default (h = ReactRouter.hashHistory) => App(h)

import * as React from "react"
import {Router, IndexRoute, Route, browserHistory} from "react-router"
const history = browserHistory

import Base from "./routes/Base"
import Index from "./routes/Index"
import Pages from "./routes/Pages"
import NoMatch from "./routes/NoMatch"

import "./App.css"

export default class App extends React.Component<any, any> {
    render() {
        return <Router history={history}>
            <Route path="/" component={Base}>
                <IndexRoute component={Index}/>
                <Route path="pages" component={Pages}>
                    <Route path=":id" component={Pages}/>
                </Route>
                <Route path="*" component={NoMatch}/>
            </Route>
        </Router>
    }
}

import * as React from "react"
import {IndexRoute, Route} from "react-router"

import Base from "./routes/Base"
import Index from "./routes/Index"
import Pages from "./routes/Pages"
import NoMatch from "./routes/NoMatch"

const router = <Route path="/" component={Base}>
    <IndexRoute component={Index}/>
    <Route path="pages" component={Pages}>
        <Route path=":id" component={Pages}/>
    </Route>
    <Route path="*" component={NoMatch}/>
</Route>

export default router

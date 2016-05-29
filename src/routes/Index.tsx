import * as React from "react"
import {Link} from "react-router"

import Greeting from "../components/Greeting"

export default class Index extends React.Component<any, any> {
    render() {
        return <div>
            <Link to={`/pages`}>pages</Link>
            <Greeting/>
        </div>
    }
}

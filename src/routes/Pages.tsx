import * as React from "react"
import {Link} from "react-router"

export default class Pages extends React.Component<any, any> {
    render() {
        return <div><Link to={`/`}>index</Link></div>
    }
}

import * as React from "react"

export default class Base extends React.Component<any, any> {
    render() {
        return <div>
            <h1>Header</h1>
            {this.props.children}
        </div>
    }
}

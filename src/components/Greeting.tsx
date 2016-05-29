import * as React from "react"

export interface IGreetingProps {
    subject?:string
}

export default class Greeting extends React.Component<IGreetingProps, any> {
    render() {
        const {subject} = this.props
        return <h1>hello {subject}</h1>
    }
}

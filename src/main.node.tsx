import * as http from "http"

const PORT = 8080
const BROWSER_SYNC = true

function configure(server:http.Server, oldhandler?:Function) {
    if (oldhandler) {
        server.removeListener("request", oldhandler)
    }
    const handler = require("./server/handler").default
    server.on("request", handler)
    return handler
}

const server = http.createServer()
let handler = configure(server)
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
    hot.decline()
    hot.accept("./server/handler", () => handler = configure(server, handler))
}

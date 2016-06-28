import * as express from "express"

const app = express.Router()

app.get("/whoami", function (req, res) {
    const s = "asdf modules"
    res.send(s)
})

export default app

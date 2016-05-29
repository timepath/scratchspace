import * as express from "express"

const app = express.Router()
module.exports = app

app.get("/whoami", function (req, res) {
    const s = "world dfg"
    res.send(s)
})

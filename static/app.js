const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const staticPath = path.join(__dirname, "../static");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(staticPath));
app.use('/static', express.static(path.join(__dirname, '../static')));
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../static') });
});

app.listen(4001, () => {
        console.log("Listening on port 4001");
});
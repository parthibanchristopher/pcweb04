import express from "express";
import mysql from "mysql2";

const pool = mysql
    .createPool({
        host: "127.0.0.1",
        user: "root",
        password: "password",
        database: "athletes",
    })
    .promise();

const app = express();
const port = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

async function getPlayers() {
    const [rows] = await pool.query("SELECT * FROM players;");
    return rows;
}

async function getPlayer(id) {
    const [rows] = await pool.query(
        `SELECT * FROM players WHERE id = ?`, [id]
    );
    return rows;
}

async function addPlayer(name, description, image) {
    const [result] = await pool.query(
        `INSERT INTO players (name, description, image) VALUES (?, ?, ?)`, [name, description, image]
    );
    const id = result.insertId;
    return getPlayer(id);
}

async function deletePlayer(id) {
    await pool.query(`DELETE FROM players where id = ?`, [id]);
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.get("/", async (req, res) => {
    const players = await getPlayers();
    console.log(players);
    res.render("index.ejs", {
        players,
    });
});

app.get("/add", async (req, res) => {
    res.render("add.ejs");
});

app.post("/add", async (req, res) => {
    const { name, description, image } = req.body;
    const note = await addPlayer(name, description, image);
    res.redirect("/");
});

app.get("/delete/:id", async (req, res) => {
    const id = req.params.id;
    await deletePlayer(id);
    res.redirect("/");
});
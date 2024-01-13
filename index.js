import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res)=>{
    try{
        const result = await db.query(`SELECT * FROM bookshelf ORDER BY id ASC`);
        const books = result.rows;
 
        res.render("index.ejs",{ books });
    }
    catch(err){
        console.log(err.message);
    }
});

app.get("/recent", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM bookshelf ORDER BY id DESC")
        const books = result.rows

        res.render("index.ejs", { books });
    }
    catch (err) {
        console.log(err.message);
    }
})

app.get("/rating", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM bookshelf ORDER BY rate DESC")
        const books = result.rows

        res.render("index.ejs", { books });
    }
    catch (err) {
        console.log(err.message);
    }
});

app.get('/mauny', (req, res) => {
    res.render("add.ejs")
});

app.post('/mauny', async (req, res) => {
    const books = req.body;

    try {
        await db.query("INSERT INTO bookshelf (title, author, isbn, rate, img, review) VALUES ($1, $2, $3, $4, $5, $6)",
        [books.title, books.author, books.isbn, books.rate, books.img, books.review]);

        res.redirect("/")
    }
    catch (err) {
        console.log(err.message);
    }
});

app.get("/detail/:id", async (req, res)=>{
    const id = req.params.id;

    try{
        const books = await db.query("SELECT * FROM bookshelf WHERE id = $1", [id]);
        res.render("detail.ejs", {
            book : books.rows[0]});
    }
    catch(err){
        console.log(err.message);
    }
});

app.get("/detail/:id/publish/edit", async(req, res)=>{
    const id = req.params.id;

    try{
        const book = await db.query("SELECT * FROM bookshelf WHERE id = $1", [id]);
        res.render("edit.ejs", {
            book : book.rows[0]});
    }
    catch(err){
        console.log(err.message);
    }
});

app.post("/publish/:id", async (req, res)=>{
    const id = req.params.id;
    const book = req.body;
    
    try{
        await db.query("UPDATE bookshelf SET id=$1, title=$2, author=$3, isbn=$4, rate=$5, img=$6, review=$7",
        [id, book.title, book.author, book.isbn, book.rate, book.img, book.review,])
        res.redirect('/');
    }
    catch(err){
        console.log(err.message);
    }
});

app.get(`/detail/:id/${process.env.DELETE}`, async (req,res) => {
    const id = req.params.id;

    try{
        await db.query("Delete From bookshelf Where id = $1", [id]);
        console.log(`Deleted book with ID ${id}`);
        res.redirect('/')
    }
    catch(err){
        console.log(err.message);
    }});

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });
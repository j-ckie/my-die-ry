const express = require("express")
const app = express();
const port = 3000;

app.set ("view engine", "pug");
app.use(express.static("public"));
app.get("/",(req,res)=>{
    res.render("index", {message: "Hey!"});
});
app.get("/register", (req, res)=>{
    res.render("register");
});
app.get("/login", (req, res)=>{
    res.render("login");
});












app.listen(port, ()=> {
    console.log(`port ${port} is running`);
});
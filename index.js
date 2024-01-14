const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
}

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'smile@05'
});

app.get("/", (req, res) => {
    let q = `SELECT count(username) from user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let resultejs = result[0]["count(username)"].toString()
            res.render("index.ejs", { resultejs })
        })

    } catch (err) {
        console.log(err);
        res.send("problem with db");
    }

})

app.get("/user", (req, res) => {
    let q = `select * from user;`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            res.render("user.ejs", { users })
        })
    } catch (err) {
        console.log(err);
        res.send("problem with db.")
    }
})

app.get("/user-form", (req, res) => {
    res.render("newuser.ejs");
})


app.post("/user", (req, res) => {
    console.log(req.body);
    let { username, password, email } = req.body;
    let genid = faker.string.uuid();
    let q3 = `INSERT INTO user(id,username,password,email) VALUES (?,?,?,?);`;
    try {
        connection.query(q3, [genid, username, password, email], (err, result) => {
            if (err) throw err;
            res.redirect("/user");
        })
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }

})

app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `select * from user where id='${id}';`
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(user);
            res.render("edit.ejs", { user });
        });
    } catch (err) {
        console.log(err);
    }
})

app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { username: newUsername, password: formPass } = req.body;
    let q = `select * from user where id='${id}';`
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formPass !== user.password) {
                res.send("wrong password!!")
            } else {
                let q2 = `UPDATE user SET username ='${newUsername}' WHERE id='${id}';`;
                try {
                    connection.query(q2, (err, result) => {
                        if (err) throw err;
                        res.redirect("/user")
                    })
                } catch (err) {
                    console.log(err);
                }
            }
        });
    } catch (err) {
        console.log(err);
    }
})

app.get("/user/:id/deleteform", (req, res) => {
    let { id } = req.params;
    let q = `select * from user where id='${id}';`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(user);
            res.render("delete.ejs", { user });
        })
    } catch (err) {
        console.log(err);
    }
})


app.delete("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let { email, password } = req.body;
    console.log( email , password);
    let q = `select * from user where id = ?;`;
    try {
        connection.query(q,[id] ,(err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(result);
            if (user.email !== email || user.password !== password) {
                console.log(user.email);
                res.send("You're not authenticated to delete this account!!!");

            } else {
                let q2 = `delete from user where id = ?;`
                connection.query(q2,[id],(err, result) => {
                    if (err) throw err;
                    res.redirect("/");
                })
            }
        })
    } catch (err) {
        console.log(err);
    }
})



app.listen(8080, () => {
    console.log(`port is listening on 8080`);
})


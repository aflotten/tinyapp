const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.set("view engine", "ejs");

const { getUserByEmail, createRandomString} = require('./helperFunctions');

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userCookie = req.cookies["username"] || null
  const templateVars = { urls: urlDatabase, username: userCookie };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});


app.post("/login", (req, res) => {
  const username = req.body.username;

  if(!username) {
    return res.status(400).send("Username cannot be empty")
  }
  res.cookie("username", username)
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
});

app.post("/urls", (req, res) => {
  const shortURL = createRandomString(6);
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL;
  res.redirect('/urls')
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_register", templateVars);
});

// register post route
app.post("/register", (req, res) => {
  correctEmail = req.body.email;
  correctPass = req.body.password;
  if (correctEmail && correctPass) {
    if (!getUserByEmail(correctEmail, users)) {
      const userID = createRandomString(8);
      users[userID] = {
        userID: userID,
        email: req.body.email,
        password: req.body.password
      };
      console.log(users)
      res.redirect("/urls");
    } else {
      const msg = "An account with this email already exists. Please try again.";
      res.sendStatus(400);
    }
  } else {
    const msg = "Username or password cannot be empty. Please try again."
    res.sendStatus(400);
  }
});



app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
})


app.listen(PORT, () => {
  console.log(`Express app listening on Port: ${PORT}`);
});
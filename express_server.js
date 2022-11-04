const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

// const cookieSession = require("cookie-session");
// app.use(cookieSession({
//   name: 'session',
//   secret: 'brucey-bruce'
// }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const { getUserByEmail, createRandomString, urlsForUser } = require('./helperFunctions');

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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const URLS = urlsForUser(userID, urlDatabase);
  console.log(URLS);
  const templateVars = {
    urls: URLS,
    user: users[userID],
  };

  if(!userID) {
    res.send("<html><body><div>Please login to view your urls.</div><a href='/login'>Login</a></body></html>");
  }

  res.render("urls_index", templateVars);

  // const userCookie = req.cookies["user_id"];
  // const templateVars = { urls: urlDatabase, user: users[userCookie] };
  // res.render("urls_index", templateVars);
});


/////////////////////////////////////
// Logout method

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});



/////////////////////////////////////
// Login get and post

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = getUserByEmail(email, users);
  const loggedInUser = users[userEmail];
  if (loggedInUser) {
    if (loggedInUser.password === req.body.password) {
      res.cookie("user_id", loggedInUser.id);
      res.redirect("/urls");
      return;
    } else {
      res.send("Password is incorrect! Please try again");
    }
  } else {
    res.send("Email not found.");
  }
});


/////////////////////////////////////
// URL routes: edit | delete | :id

app.post("/urls", (req, res) => {
if (req.cookies.user_id) {
  const shortURL = createRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${shortURL}`);
} else {
  res.send("Please login to view this page.")
}
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if(!longURL) {
    return res.send("<html><body><div>Page does not exist within the database.</div><a href='/urls'>Back to main page</a></body></html>")
  }
  res.redirect(longURL);
});

/////////////////////////////////////
// Register get and post

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const correctEmail = req.body.email;
  const correctPass = req.body.password;
  const user_id = createRandomString(8);

  if (!correctEmail || !correctPass || getUserByEmail(correctEmail, users)) {
    res.status(400).send("Email already exists, please go to the login page and sign in.");
  } else {
    users[user_id] = {
      id: user_id,
      email: correctEmail,
      password: correctPass
    };
    console.log(correctEmail);
    console.log(urlDatabase);
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Express app listening on Port: ${PORT}`);
});
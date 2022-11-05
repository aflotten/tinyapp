const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  secret: 'brucey-bruce'
}));

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

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const URLS = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: URLS,
    user: users[userID],
  };

  if (!userID) {
    res.send("<html><body><div>Please login to view your urls.</div><a href='/login'>Login</a></body></html>");
  }

  res.render("urls_index", templateVars);
});


/////////////////////////////////////
// Logout method

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});

/////////////////////////////////////
// Login get and post

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = getUserByEmail(email, users);
  const loggedInUser = users[userEmail.id];
  if (loggedInUser) {
    if (bcrypt.compareSync(password, loggedInUser.password)) {
      req.session.user_id = userEmail.id;
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
  if (req.session.user_id) {
    const shortURL = createRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls`);
  } else {
    res.send("Please login to view this page.");
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session["user_id"]] };
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase, user: users[req.session["user_id"]] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("<html><body><div>Unauthorized to edit URL. Please login.</div><a href='/login'>Login</a></body></html>");
  } else {
    const URLS = urlsForUser(userID, urlDatabase);
    if (URLS[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
      return res.redirect("/urls");
    } else {
      return res.status(400).send("<html><body><div>Unauthorized to edit URL. Please login.</div><a href='/login'>Login</a></body></html>");
    }
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("<html><body><div>Unauthorized to delete URL. Please loging</div><a href='/login'>Login</a></body></html>");
  } else {
    const URLS = urlsForUser(userID, urlDatabase);
    const del = req.params.shortURL;
    if (URLS[del]) {
      delete urlDatabase[del];
      res.redirect("/urls");
    } else {
      return res.status(400).send("<html><body><div>URL not in database.</div><a href='/urls'>Back to main page</a></body></html>");
    }
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    return res.send("<html><body><div>Page does not exist within the database.</div><a href='/urls'>Back to main page</a></body></html>");
  }
  res.redirect(longURL);
});

/////////////////////////////////////
// Register get and post

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = createRandomString(8);

  if (!req.body.email || !req.body.password || getUserByEmail(req.body.email, users)) {
    res.status(400).send("Email already exists, please go to the login page and sign in.");
  } else {
    req.session.user_id = user_id;
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Express app listening on Port: ${PORT}`);
});
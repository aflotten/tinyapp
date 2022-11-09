//server + port requirements
const express = require("express");
const app = express();
const PORT = 8080;

//password requirements
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

//cookie requirements
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  secret: 'brucey-bruce'
}));

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//import helper functions
const { getUserByEmail, createRandomString, urlsForUser } = require('./helperFunctions');

//user account objects
const users = {};
const urlDatabase = {};

//tinyapp homepage -> redirect to log in if not already
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//display a users urls if logged in or prompted to login
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
// Logout method - clear cookies which will redirect to login, and if server is still up, allow users to log back in.
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});

/////////////////////////////////////
// Login get and post

//render login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

// get user email and hashed password to check/match within database and redirect the logged in user to /urls
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const loggedInUser = getUserByEmail(email, users);

  if(!email || !password) {
    return res.status(400).send("Email or password is invalid, please try again.");
  }

  if (loggedInUser === null) {
    return res.status(400).send("This email does not exist, please check email or register account.");
  }

  if(!bcrypt.compareSync(password, loggedInUser.password)) {
    return res.status(400).send("Incorrect password, please try again.");
  } else {
    req.session.user_id = loggedInUser.id;
    res.redirect("/urls");
  }
});



/////////////////////////////////////
// URL routes: edit | delete | :id

//submits form from user to make shortURL
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = createRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("Please login to view this page.");
  }
});

//if user is logged in, render create new shortURL page - otherwise redirect to login
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
  if(req.session.user_id === urlDatabase[req.params.id].userID) {
  res.render("urls_show", templateVars);
  } else {
    res.status(400).send("<html><body><div>Unauthorized to access URLs. Please login.</div><a href='/login'>Login</a></body></html>");
  }
});

//submits form to allow user to edit an existing url within their database object if logged in
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

//submits form to allow user to delete an existing url within their database object if logged in
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("<html><body><div>Unauthorized to delete URL. Please login.</div><a href='/login'>Login</a></body></html>");
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

//Prompt a redirect to /urls if a page does not exist

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  let longURL = null;
  for(let record in urlDatabase) {
    if (id.toString() === record.toString()) {
      longURL = urlDatabase[record].longURL;
    }
  }
  if (!longURL) {
    res.send("<html><body><div>Page does not exist within the database.</div><a href='/urls'>Back to main page</a></body></html>");
    hasRun = true;
  } else {
   res.redirect(longURL);
  };
});

/////////////////////////////////////
// Register get and post

//render register page for non logged in users.
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_register", templateVars);
});

//submits form to allow user to register account if email is unique to database. App will hash and store password. 
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
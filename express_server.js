const express = require("express");
const app = express();
const PORT = 8080;
app.use(express.urlencoded({ extended: true }));


app.set("view engine", "ejs");

function generateRandomString(desiredLength) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < desiredLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello<b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
})


app.listen(PORT, () => {
  console.log(`Example app listening on Port: ${PORT}`);
});
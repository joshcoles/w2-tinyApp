//================ Dependencies ===================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs")


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



//============= Home Page ==========================
// redirects to list of urls
app.get("/", (req, res) => {
  res.redirect("/login");
});

//
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
   };
   console.log(req.cookies);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {
    username: req.cookies["username"]
  });
});

app.get("/urls/:id", (req, res) => {

  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  let updatedURL = req.body.updatedURL;
  urlDatabase[req.params.id] = fixURL(updatedURL);
  console.log(urlDatabase[req.params.id])
  res.redirect(`/urls/${req.params.id}`)
});

app.post("/urls", (req, res) => {

  //assign long url value to the value of what's put in text field
  let longURL = req.body.longURL;
  //assign shorturl to generated random string
  let shortURL = generateRandomString();
  //assign short and long url as key value pairs
  urlDatabase[shortURL] = fixURL(longURL);
  //after assigning, redirect browser to url pair list

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) =>{

  let shortURL = req.params.id;
  delete urlDatabase[shortURL];

  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})


//============== Cookies ========================



// app.get("/urls.json", (req, res) {
//   res.json(urlDatabase);
// });

app.post("/logout", (req, res) => {
  // Object.keys(req.cookies).forEach(function(property) {
  //   res.clearCookie(property);
  // });

  res.clearCookie("username");

  res.redirect("/login")
})

app.get("/login", (req, res) => {
  if (req.cookies["username"]) {
    res.redirect("/urls");
  } else {
    res.render("login")
  }
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  // console.log(username);



  res.redirect("/urls");
})








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString () {
  return Math.random().toString(36).substr(2, 6);
}

function fixURL(longURL) {
  if (!(longURL.includes("://"))) {
    longURL = "http://" + longURL;
  }
  return longURL;
}






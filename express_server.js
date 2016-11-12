//================ Dependencies ==================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
//users database is required from separate .json file and is further populated from POST to /register.
const users = require("./users.json");
const bcrypt = require("bcrypt");

//================= MIDDLEWARE =========================

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["joshkey", "secretkey"],
  maxAge: 24 * 60 * 60 * 1000
}));
app.set("trust proxy", 1);
app.set("view engine", "ejs");

//For every request, this assigns the value of
//idOfUserFromSession to the session called "userID".

//The current user is set to equal the user from the user object that
//matches IDs with the cookie.

//If there is no current user and the path is not one of the listed endpoints
//then redirect to /login

app.use(function(req, res, next) {
  let idOfUserFromSession = req.session.userID;
  req.currentUser = users[idOfUserFromSession];
  if (req.currentUser === undefined && (req.path !== "/login" && req.path !== "/register" && req.path !== "/urls/new" && req.path !== "/urls" && !req.path.startsWith("/u/"))) {
    res.redirect("/login");
    return;
  } else {
    next();
  }
});

//================= Data ================================

//Re-structured url database. Each URL is assigned to to userID
//of the user that created it.

//test urls, assigned to pre-existing users imported from users.json. Makes testing faster.
const urlDatabase = {
  "9sm5xk": {
    "userID": "lkjhgfghjkl",
    "shortURL": "9sm5xk",
    "longURL": "http://www.google.com"
  },
  "b2xVn2": {
    "userID": "ggggttttttt",
    "shortURL": "b2xVn2",
    "longURL": "http://lighthouselabs.ca"
  }
};

//==================== FUNCTIONS ==========================

//Used for creating random string for shortURL.
function generateRandomString () {
  return Math.random().toString(36).substr(2, 6);
}

//Used for generating unique ID for each user in Users object.
function generateRandomUserID () {
  return Math.random().toString(36).substr(2, 20);
}

//Used to fix URLs that don't include 'www.' or 'http://' in
//both url creation and editing
function fixURL(originalURL) {
  if (!(originalURL.includes("://"))) {
    originalURL = "http://" + originalURL;
  }
  return originalURL;
}

//============= Home Page / Login ===================

//automatically redirects to login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

//redirects to urls if logged in
//otherwise renders register
app.get("/register", (req, res) => {
  if (req.currentUser) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      email: req.session.userID
    };
    res.render("register", templateVars);
  }
});

//Renders login page, unless user is already signed in. If user is
//signed in, redirect to /urls.
app.get("/login", (req, res) => {
  if (req.currentUser) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

//When a user submits login information, their email and password are
//assigned to loginEmail and loginPassword.
app.post("/login", (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;

//decides which user's email will be checked in next section
  let user = null;
  for (let userId in users) {
    let userCandidate = users[userId];
    if (userCandidate.email === loginEmail) {
      user = userCandidate;
    }
  }

//user is decided, user's password is checked (with bcrypt.compare) against
//loginPassword. Error redirects to /login, non-matching passwords renders 401 error,
//successful match redirects to /urls.
  if (user === null) {
    res.status(403).send("Incorrect email or password. Please register or check your password.");
  } else {
    bcrypt.compare(loginPassword, user.password, function(err, passwordMatches){
      if (err) {
        res.redirect("/login");
      } else if (!passwordMatches) {
        res.status(401).render("401");
      } else {
        req.session.userID = user.id;
        res.redirect("/urls");
      }
    });
  }
});

//================ ADD URL ==========================

//if user is logged in, renders new URL submission page.
//otherwise render 401 page.
app.get("/urls/new", (req, res) => {
  if (req.currentUser === undefined) {
    res.status(401).render("401");
  } else {
    res.render("urls_new", {
      email: req.currentUser.email
    });
  }
});

//=============== LIST OF URLS =======================

//if not logged in, renders 418 easter egg (You found it!);
app.get("/urls", (req, res) => {

  if (req.currentUser === undefined) {
    res.status(418).render("418");
  } else {

//loops over urlDatabase and pushes each url that is associate with
//current user (req.currentUser.id), which is assigned to
//templateVars and exported to urls_index.
    var currentUsersURLs = [];
    for (var url in urlDatabase) {
      if (urlDatabase[url].userID === req.currentUser.id) {
        currentUsersURLs.push(urlDatabase[url]);
      }
    }
    let templateVars = {
      urls: currentUsersURLs,
      email: req.currentUser.email
    };
    res.render("urls_index", templateVars);
  }
});

//creates a new tinyURL
//shortURL is created by generateRandomString(); and longURL is
//fixed (if necessary) by fixURL();
//tinyURL is then assigned to urlDatabase, with currentUser's id attached to it
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: fixURL(longURL),
    userID: req.currentUser.id
  };
  res.redirect(`/urls/${shortURL}`);
});

//=================== UNIQUE URL ====================

//displays page specific to a tinyURL with option to update (edit) or delete.
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].longURL,
    username: req.session.userID,
    email: req.currentUser.email
  };
  res.render("urls_show", templateVars);
});

//updates tinyURL
app.post("/urls/:id", (req, res) => {
  let updatedURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = fixURL(updatedURL);
  res.redirect(`/urls/${req.params.id}`);
});

//redirects to longURL, unless url is invalid in which case renders 404
app.get("/u/:shortURL", (req, res) => {
  for (var url in urlDatabase) {
    if (req.params.shortURL === urlDatabase[url].shortURL) {
      res.redirect(urlDatabase[req.params.shortURL].longURL);
      return;
    }
  }
  res.status(404).render("404");
  return;
});

//=============== DELETE =============================

//deletes tinyURL from urlDatabase
app.post("/urls/:id/delete", (req, res) =>{
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//==================== JSON ============================

//provides .json version of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//==================== LOGOUT ==========================

//logs out, redirects to /login and deletes cookie/session
app.post("/logout", (req, res) => {
  req.session.userID = null;
  console.log("Cookie deleted.");
  res.redirect("/login");
});

//================= USER AUTHENTICATION ==================

//if either email or password field is empty, returns 400 and renders "400-empty-field"
//if email already exists in user database, returns 400 and renders "400-duplicate"
app.post("/register", (req, res) => {

  if ((req.body.email === "") || (req.body.password === "")) {
    res.status(400).render("400-empty-field");
  } else {
    for (let i in users) {
      if (req.body.email === users[i].email) {
        res.status(400).render("400-duplicate");
      }
    }
//else, assigns user to user database including randomly-generated ID and
//hashed password
    let userID = generateRandomUserID();
    users[userID] = {};
    users[userID].id = userID;
    users[userID].email = req.body.email;
    users[userID].password = bcrypt.hashSync(req.body.password, 10);
    res.redirect("/login");
  }
});

//================== LISTEN ==============================

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

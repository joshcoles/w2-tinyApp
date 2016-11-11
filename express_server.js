//================ Dependencies ==================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


//================= MIDDLEWARE =========================
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


app.set('trust proxy', 1)
app.set("view engine", "ejs");



//================= Data ==========================

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

}

//==================== FUNCTIONS ==========================

function generateRandomString () {
  return Math.random().toString(36).substr(2, 6);
}

function generateRandomUserID () {
  return Math.random().toString(36).substr(2, 20);
}

function fixURL(longURL) {
  if (!(longURL.includes("://"))) {
    longURL = "http://" + longURL;
  }
  return longURL;
}

//============= Home Page / Login ===================



app.get("/", (req, res) => {
 res.redirect("/register");
});


app.get("/register", (req, res) => {
  let templateVars = {
    email: req.cookies["User-ID"]
  };
    res.render("register", templateVars);
})



app.get("/login", (req, res) => {


  res.render("login");

});


app.post("/login", (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;

  console.log("Login email: " + loginEmail);
  console.log("Login password: " + loginPassword);


  for (let i in users) {
    if ((loginPassword === users[i].password) && (loginEmail === users[i].email)) {
      res.cookie("User-ID", users[i].id)
      res.redirect("/urls");
      return;
    }
  }
  res.redirect("/login")
});

//================ ADD URL ==========================


app.get("/urls/new", (req, res) => {
  /*if (!req.cookies["User-ID"]) {
    res.redirect("/login");
  }
  let currentUser = users[req.cookies["User-ID"]].
  res.render("urls_new", {
    email: currentUser.username;
  });*/

  let idOfUserFromCookie = req.cookies["User-ID"];
  let currentUser = users[idOfUserFromCookie];

    if (currentUser) {
      res.render("urls_new", {
        email: currentUser.email
      });
    } else {
      res.redirect("/login");
      return;
    }
});


//=============== LIST OF URLS =======================

app.get("/urls", (req, res) => {

  let idOfUserFromCookie = req.cookies["User-ID"];
  let currentUser = users[idOfUserFromCookie];

  let templateVars = {
    urls: urlDatabase,
    email: currentUser.email
  };

  if (currentUser) {
    console.log("Cookie created for the username: " + "'" + req.cookies["User-ID"] + "'.");
    res.render("urls_index", templateVars)
  } else {
    res.redirect("/login");
  }
});


app.post("/urls", (req, res) => {
  if (!req.cookies["User-ID"]) {
    res.redirect("/login");
  }
  //assign long url value to the value of what's put in text field
  let longURL = req.body.longURL;
  //assign shorturl to generated random string
  let shortURL = generateRandomString();
  //assign short and long url as key value pairs
  urlDatabase[shortURL] = fixURL(longURL);
  //after assigning, redirect browser to url pair list

  res.redirect(`/urls/${shortURL}`);
});




//=================== UNIQUE URL ====================

app.get("/urls/:id", (req, res) => {
  if (!req.cookies["User-ID"]) {
    res.redirect("/login");
  }
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    username: req.cookies["User-ID"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  if (!req.cookies["User-ID"]) {
    res.redirect("/login");
  }
  let updatedURL = req.body.updatedURL;
  urlDatabase[req.params.id] = fixURL(updatedURL);
  console.log(urlDatabase[req.params.id]);
  res.redirect(`/urls/${req.params.id}`);
});

app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//=============== DELETE =============================

app.post("/urls/:id/delete", (req, res) =>{
  if (!req.cookies["User-ID"]) {
    res.redirect("/login");
  }
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//==================== JSON ============================

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//==================== LOGOUT ==========================

app.post("/logout", (req, res) => {
  // Object.keys(req.cookies).forEach(function(property) {
  //   res.clearCookie(property);
  // });

  res.clearCookie("User-ID");
  console.log("Cookie deleted.");

  res.redirect("/login");
});



//================= USER AUTHENTICATION ==================


app.post("/register", (req, res) => {

  let userID = generateRandomUserID();
  users[userID] = {};
  users[userID].id = userID;
  users[userID].email = req.body.email;
  users[userID].password = req.body.password;
  console.log(users);

  // console.log("users.userID.id: " + users.userID.id);
  // console.log("users.userID.email: " + users.userID.email);
  res.redirect("/login");
})



//================== LISTEN ==============================

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//================= Language Options ====================

// app.get("/choose_english", (req, res) => {
//   res.cookie('language', 'english');
//   res.redirect("/");
// })

// app.get("/choose_french", (req, res) => {
//   res.cookie('language', 'english');
//   res.redirect('/');
// })






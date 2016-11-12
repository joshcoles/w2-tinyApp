//================ Dependencies ==================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');












//================= MIDDLEWARE =========================
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['joshkey', 'secretkey'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//For every request, this assigns the value of
//idOfUserFromCookie to the cookie called "userID".

//The current user is equal to the user from the user object that
//matches IDs with the cookie.

//If there is no current user and the path is not /login or /register
//then redirect to /login, which now includes a link to /register.

app.use(function(req, res, next) {
  let idOfUserFromCookie = req.session.userID;
  req.currentUser = users[idOfUserFromCookie];
  if (req.currentUser === undefined && (req.path !== "/login" && req.path !== "/register" && !req.path.startsWith("/u/"))) {
    res.redirect("/login");
  } else {
    next();
  }
})

app.set('trust proxy', 1)
app.set("view engine", "ejs");



//================= Data ================================


//Re-structured url database. Each URL is assigned to to userID
//of the user that created it.

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




//User database. Empty to begin with except for a pre-programmed
//users 'a@a.com' and josh@joshcoles.com which is imported from
//this .json file.

//Populated by filling in and submitting form on register page.
const users = require('./users.json')

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
function fixURL(longURL) {
  if (!(longURL.includes("://"))) {
    longURL = "http://" + longURL;
  }
  return longURL;
}

//============= Home Page / Login ===================


//automatically redirects to registration page
app.get("/", (req, res) => {
 res.redirect("/login");
});

//
app.get("/register", (req, res) => {
  let templateVars = {
    email: req.session.userID
  };
    res.render("register", templateVars);
})


//Renders login page, unless user is already signed in. If user is
//signed in, redirect to /urls.
app.get("/login", (req, res) => {
  if (req.currentUser) {
    res.redirect("/urls")
  } else {
    res.render("login");
  }
});

//When a user submits login information, their email and password are
//assigned to loginEmail and loginPassword.

app.post("/login", (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;

  //console.log(loginPassword);

  //This checks loginEmail and loginPassword against our user object
  //AKA registered users database.

  //If they both match, set cookie as { "userID": 293587hsdgo823h3gg }
  //and redirect to "/urls". This is the breakpoint where users are
  //either allowed to access the site or they are not.



  // 1) figure out which user the request wants to log in as
  // 2) did that work out?
  //    2a, yes i) make a call to bcrypt.compare.
  //            ii) did that work?
  //                  yes ) log them in
  //                  no  ) do something else (redir to login page?)
  //    2b, no  i) do something else (redir to login page?)

  // console.log("users:", users);

  var user = null;
  for (userId in users) {
    var user_candidate = users[userId];
    if (user_candidate.email === loginEmail) {
      user = user_candidate;
    }
  }

  if (user === null) {
    // res.redirect("/login");
    res.status(403).send("Incorrect email or password. Please register or check your password.")

  } else {
    // var samePass = bcrypt.compareSync(loginPassword, user.password);
    // if (samePass){
    //   yay();
    // } else {
    //   boo();
    // }


    bcrypt.compare(loginPassword, user.password, function(err, passwordMatches){
      if (err) {
        // console.log("error in bcrypt?", err);
        res.redirect("/login");
      } else if (!passwordMatches) {
        res.status(403).send("Incorrect email or password. Please register or check your password.")
      } else {
        req.session.userID = user.id;
        res.redirect("/urls");
      }
    });
  }



  // 1) make a function F to see if this req has a correct password
  // 2) for all users, see if they match on username (using ===) and on password (using F)
  // 3) if there was more than one of those, or zero of those, freak out
  // 4) if there was one of those, log them in


  // var arePasswordsTheSame = bcrypt.compare(loginPassword, users[i].password, function (err, passwordMatches) {
  //   if (passwordMatches) {
  //     return true;
  //   } else {
  //     res.status(403).send("wrong password mannnn");
  //   }
  // })

  // for (let i in users) {
  //   if (true && (loginEmail === users[i].email)) {
  //     res.cookie("userID", users[i].id);
  //     res.redirect("/urls");
  //     return;
  //   }
  // }

  //When logging in, this throws an error if the loginEmail or
  //loginPassword do not match the users object data.

  // for (let i in users) {
  //   if ((users[i].email !== loginEmail) || true ) {
  //     res.status(403).send("Incorrect email or password. Please register or check your password.")
  //     return;
  //   }
  // }

});  // app.post("/login", ....)


//================ ADD URL ==========================

//If user is logged in, render new URL submission page.

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {
    email: req.currentUser.email
  });
});


//=============== LIST OF URLS =======================

//Renders urls_index (list of urls).

app.get("/urls", (req, res) => {

//Exports data
  //urlDatabase becomes available for display using forEach loop
  //email becomes available for display in navBar


  //fill array with urls (objects) that belong to
  //req.currentUser
  //check that userID is equal to req.currentUser.id
  //push to currentUsersURLs
  //pass that into templatevars -> urls
  var currentUsersURLs = [];

  for (var url in urlDatabase) {
    if (urlDatabase[url].userID === req.currentUser.id) {
      currentUsersURLs.push(urlDatabase[url]);
    }
  }

  // console.log("User id: " + req.currentUser.id);
  // console.log("new array" + currentUsersURLs);


  let templateVars = {
    urls: currentUsersURLs,
    email: req.currentUser.email
  };


//
  console.log("Cookie created for the username: " + "'" + req.session.userID + "'.");
  res.render("urls_index", templateVars)

});


app.post("/urls", (req, res) => {

    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    // console.log(urlDatabase);
    // console.log(shortURL);
    // console.log(urlDatabase[shortURL]);
    urlDatabase[shortURL] = {
      shortURL: shortURL,
      longURL: fixURL(longURL),
      userID: req.currentUser.id
    }
    res.redirect(`/urls/${shortURL}`);

});



//=================== UNIQUE URL ====================

app.get("/urls/:id", (req, res) => {
// let idOfUserFromCookie = req.cookies["userID"];
// let currentUser = users[idOfUserFromCookie];

  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].longURL,
    username: req.session.userID,
    email: req.currentUser.email
  }
console.log(urlDatabase);
  res.render("urls_show", templateVars)

});

app.post("/urls/:id", (req, res) => {

  let updatedURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = fixURL(updatedURL);
  console.log(urlDatabase[req.params.id].longURL);
  res.redirect(`/urls/${req.params.id}`);
});

app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


//=============== DELETE =============================

app.post("/urls/:id/delete", (req, res) =>{

  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//==================== JSON ============================

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//==================== LOGOUT ==========================

app.post("/logout", (req, res) => {

  req.session.userID = null;
  // res.clearCookie("userID");
  console.log("Cookie deleted.");

  res.redirect("/login");
});



//================= USER AUTHENTICATION ==================


app.post("/register", (req, res) => {


  for (var i in users) {
    if (req.body.email === users[i].email) {
      res.status(400);
      res.send('Email already taken');
      return;
    }
  }

  let userID = generateRandomUserID();
  users[userID] = {};
  users[userID].id = userID;
  users[userID].email = req.body.email;
  users[userID].password = bcrypt.hashSync(req.body.password, 10);
  console.log(users);

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






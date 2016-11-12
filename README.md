<!-- GET /

if user is logged in:
redirect -> /urls
if user is not logged in:
redirect -> /login
 -->

<!-- GET /urls


if user is logged in:
returns a 200 response, HTML with:
the site header (see below)
a table of urls the user has created, each row:
short url
long url
edit button -> GET /urls/:id
delete button -> POST /urls/:id/delete
date created (stretch)
number of visits (stretch)
number of unique visits (stretch)
a link to "Create a New Short Link" -> /urls/new
 -->


<!-- GET /urls/new


if user is not logged in:
returns a 401 response, HTML with:
error message
a link to /login
if user is logged in:
returns a 200 response, HTML with:
the site header (see below)
a form, which contains:
text input field for the original URL
submit button -> POST /urls
 -->



GET /urls/:id


if url w/ :id does not exist:
returns a 404 response, HTML with a relevant error message
if user is not logged in:
returns a 401 response, HTML with a relevant error message and a link to /login
if logged in user does not match the user that owns this url:
returns a 403 response, HTML with a relevant error message
<!-- if all is well:
returns a 200 response, HTML with:
the short url
date created (stretch)
number of visits (stretch)
number of unique visits (stretch)
a form, which contains:
the long url
"update" button -> POST /urls/:id
"delete" button -> POST /urls/:id/delete -->






<!-- GET /u/:id

if url with :id exists:
redirect -> the corresponding longURL
otherwise:
returns a 404 response, HTML with a relevant error message

 -->







POST /urls

if user is logged in:
generates a shortURL, saves the link and associates it with the user
redirect -> /urls/:id
if user is not logged in:
returns a 401 response, HTML with a relevant error message and a link to /login







POST /urls/:id

if url with :id does not exist:
returns a 404 response, HTML with a relevant error message
if user is not logged in:
returns a 401 response, HTML with a relevant error message and a link to /login
if user does not match the url owner:
returns a 403 response, HTML with a relevant error message
if all is well:
updates the url
redirect -> /urls/:id








<!--
GET /login

if user is logged in:
redirect -> /
if user is not logged in:
returns a 200 response, HTML with:
a form which contains:
input fields for email and password
submit button -> POST /login -->







<!--

GET /register

if user is logged in:
redirect -> /
if user is not logged in:
returns a 200 response, HTML with:
a form, which contains:
input fields for email and password
"register" button -> POST /register
 -->






<!-- POST /register

if email or password are empty:
returns a 400 response, with a relevant error message
if email already exists:
returns a 400 response, with a relevant error message
if all is well:
creates a user
encrypts their password with bcrypt
sets a cookie
redirect -> / -->





<!--

POST /login

if email & password params match an existing user:
sets a cookie
redirect -> /
if they don't match:
returns a 401 response, HTML with a relevant error message

 -->




<!--
POST /logout

deletes cookie
redirect -> /
 -->




THE SITE HEADER:

if a user is logged in, the header shows:
user's email
"My Links" link -> /urls
logout button -> POST /logout
if not logged in, the header shows:
a link to the log-in page /login
a link to the registration page /register
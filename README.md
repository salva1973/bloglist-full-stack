# Bloglist Full Stack

## Tests examples

```sh
npm test -- -t "favoriteBlog"
```

## Tests

```sh
npm test -- tests/blog_api.test.js
npm test -- -t "a specific blog is within the returned blogs"
npm test -- -t 'blogs'
```

## Authentication

The other solution is to save info about each token to backend database and to check for each API request if the access right corresponding to the token is still valid. With this scheme, access rights can be revoked at any time. This kind of solution is often called a server-side session.

The negative aspect of server-side sessions is the increased complexity in the backend and also the effect on performance since the token validity needs to be checked for each API request to the database. A database access is considerably slower compared to checking the validity of the token itself. That is why it is quite common to save the session corresponding to a token to a key-value database such as Redis that is limited in functionality compared to eg. MongoDB or relational database but extremely fast in some usage scenarios.

When server-side sessions are used, the token is quite often just a random string, that does not include any information about the user as it is quite often the case when jwt-tokens are used. For each API request, the server fetches the relevant information about the identity of the user from the database. It is also quite usual that instead of using Authorization-header, cookies are used as the mechanism for transferring the token between the client and the server.
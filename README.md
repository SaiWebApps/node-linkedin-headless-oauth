node-linkedin-headless-oauth
===================
Handle the [node-linkedin](https://www.npmjs.com/package/node-linkedin) package's authentication procedures without ever having to interact with a browser.

----------

Overview
-------------
There are two parts to authenticating with OAuth 2.0 in the Linked API:
1. Requesting an Authorization Code
2. Exchanging the Authorization Code for an Access Token

Normally, for step 1, [node-linkedin](https://www.npmjs.com/package/node-linkedin) requires the client to start the server, open a browser, and navigate to a specific url (e.g., http://localhost:5000/oauth/linkedin) to authorize the app to connect to the LinkedIn API.

Thanks to this library, the client no longer needs to do so; instead, she can now programmatically obtain the authorization code.
As of v2.0.0, this library also handles step 2; it programmatically obtains an authorization code and trades said code for an access token. Afterwards, it utilizes the access token to initiate a connection the LinkedIn API (a.k.a, LinkedIn.init('access_token')) and exposes said connection to the user.
All in all, this library handles authenticating to the LinkedIn API via OAuth 2.0, so that consumers only have to provide the necessary credentials before using the API.

----------

Specifics
-------------

**WITHOUT THIS LIBRARY**

```nodejs
var app = require('express')();

var linkedin = null;

var linkedinAuthMgr = require('node-linkedin')('app-id','secret','callbackUrl');

// User needs to open browser and navigate to this
// URL, where she will enter email & password to
// authorize this app to connect to LinkedIn API.
app.get('/oauth/linkedin', function(req, res) {
	linkedinAuthMgr.auth.authorize(res, 
		['r_basicprofile']);
});

app.get('/oauth/linkedin/callback', function(req, res) {
	linkedinAuthMgr.auth.getAccessToken(
		res, req.query.code, req.query.state, 
		function(err, results) {
			if(err) { throw err; }
			linkedin = linkedinAuthMgr.init(
				result.access_token);
			return res.redirect('/');	
		}
	);
});

app.get('/', function(req, res) {
	linkedin.people.me(function(err, $in) {
		console.log($in);
	});
});
```

**WITH THIS LIBRARY**

```nodejs
var app = require('express')();

// This library
var linkedinAuthUtils = require('node-linkedin-headless-oauth');
linkedinAuthUtils.run('config.json', app, function(req, res) {
	res.redirect('/');
});
app.get('/', function(req, res) {
	linkedinAuthUtils.linkedin.people.me(function(err, $in) {
		console.log($in);
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Node app is running on port', port);
});
```

----------
Usage
-------------

```nodejs
linkedinAuthUtils.run(pathToJsonConfigFile, expressJSAppObject, responseHandlerFunction);
```
```pathToJsonConfigFile```
	Path to JSON configuration file.
	File should be structured as follows:
	{
		"apiKey": "",
		"secret": "",
		"email": "",
		"password": "",
		"callbackUrl": "",
		"scope": [""]
	}

```expressJSAppObject```
	The ExpressJS app that is connecting to the LinkedIn API and is using this library
	to authenticate into LinkedIn via OAuth 2.0
	Example: "require('express')()"

```responseHandlerFunction```
	Function to execute after receiving the access token and initializing the connection
	to the LinkedIn API (stored in linkedinAuthUtils.linkedin).
	Example: function(req, res) { res.redirect('/'); }

```linkedinAuthUtils.linkedin```
Object that serves as a connection to LinkedIn API; use to make API calls. Check [node-linkedin](https://www.npmjs.com/package/node-linkedin): 0.5.4 for usage information.

----------
Dependencies
-------------
[phantomjs-prebuilt](https://www.npmjs.com/package/phantomjs-prebuilt): 2.1.12
[node-horseman](https://www.npmjs.com/package/node-horseman): 3.1.1
[node-linkedin](https://www.npmjs.com/package/node-linkedin): 0.5.4
[jsonfile](https://www.npmjs.com/package/jsonfile): 2.3.1
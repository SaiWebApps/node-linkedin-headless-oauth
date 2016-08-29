node-linkedin-headless-oauth
===================
Access [node-linkedin](https://www.npmjs.com/package/node-linkedin) without ever having to interact with a browser.

----------

Overview
-------------
Normally, [node-linkedin](https://www.npmjs.com/package/node-linkedin) requires the client to start the server, open a browser, and navigate to a specific url (e.g., http://localhost:5000/oauth/linkedin) to authorize the app to connect to the LinkedIn API.

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
Thanks to this API, the client no longer needs to reserve a URI or open the browser to grant this app permission/authorization to connect to the LinkedIn API.
Instead, this formerly manual work will be offloaded to a [node-horseman](https://www.npmjs.com/package/node-horseman) headless browser.

----------
Dependencies
-------------
[phantomjs-prebuilt](https://www.npmjs.com/package/phantomjs-prebuilt): 2.1.12
[node-horseman](https://www.npmjs.com/package/node-horseman): 3.1.1
[node-linkedin](node-linkedin): 0.5.4
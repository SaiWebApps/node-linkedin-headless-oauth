var app = require('express')();

var linkedin = null;

var linkedinAuthMgr = require('node-linkedin')('app-id', 'secret', 
	'http://localhost:5000/oauth/linkedin/callback');
var authUrl = linkedinAuthMgr.auth.authorize(['r_basicprofile']);

var browser = new (require('node-horseman'))();
browser
	.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
	.open(authUrl)
	.type('input[name="session_key"]', 'email')
	.type('input[name="session_password"]', 'password')
	.click('input[name="authorize"]')
	.do(function() { while(linkedin !== null && linkedin !== undefined); })
	.close();

app.get('/oauth/linkedin/callback', function(req, res) {
	linkedinAuthMgr.auth.getAccessToken(res, req.query.code, req.query.state,
		function(err, results) {
			if (err) { 
				throw err; 
			}
			linkedin = linkedinAuthMgr.init(results.access_token);
			return res.redirect('/');
		}
	);
});

app.get('/', function(req, res) {
	linkedin.people.me(function(err, $in) {
		console.log($in);
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Node app is running on port', port);
});
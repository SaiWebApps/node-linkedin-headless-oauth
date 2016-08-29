var app = require('express')();

var linkedinAuthUtils = require('./linkedin-auth-utils');
linkedinAuthUtils.run('config.json', app, function(req, res) {
	res.redirect('/')
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
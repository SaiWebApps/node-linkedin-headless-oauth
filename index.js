function authorize(linkedinAuthMgr, email, password, scope)
{
	var authUrl = linkedinAuthMgr.auth.authorize(scope);
	var browser = new (require('node-horseman'))();

	browser
		.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
		.open(authUrl)
		.type('input[name="session_key"]', email)
		.type('input[name="session_password"]', password)
		.click('input[name="authorize"]')
		.wait(15000)
		.close();
}

function acquireAccessToken(linkedinAuthMgr, app, route, handleResponse) 
{
	app.get(route, function(req, res) {
		linkedinAuthMgr.auth.getAccessToken(
			res, req.query.code, req.query.state,
			function(err, results) {
				if (err) { 
					throw err; 
				}
				exports.linkedin = linkedinAuthMgr.init(results.access_token);
				return handleResponse(req, res);
			}
		);
	});
}

exports.linkedin = null;

exports.run = function(apiConfigFile, app, handleResponse) {
	var apiConfig = require('jsonfile').readFileSync(apiConfigFile);

	var linkedinAuthMgr = require('node-linkedin')(apiConfig.apiKey, 
		apiConfig.secret, apiConfig.callbackUrl);
	var route = require('url').parse(apiConfig.callbackUrl).path;

	authorize(linkedinAuthMgr, apiConfig.email, apiConfig.password, 
		apiConfig.scope);
	acquireAccessToken(linkedinAuthMgr, app, route, handleResponse);
};
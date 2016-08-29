/**
 * Step 1 of OAuth 2.0 process - Authorize app to connect to LinkedIn API.
 *
 * @param linkedinAuthMgr
 * LinkedIn Authentication Manager object, provides methods for performing
 * various stages of OAuth 2.0 authentication.
 *
 * @param email
 * Email address of LinkedIn profile for which we want to retrieve details
 * programmatically.
 *
 * @param password
 * Password of LinkedIn profile for which we want to retrieve details
 * programmatically.
 *
 * @param scope
 * Amount of information that we're allowed to access programmatically
 * for the given user's profile.
 */
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

/**
 * Step 2 of OAuth 2.0 process - Exchange authorization code obtained in
 * step 1 for access token, and use access token to open connection to
 * LinkedIn API.
 *
 * @param linkedinAuthMgr
 * LinkedIn Authentication Manager object, provides methods for performing
 * various stages of OAuth 2.0 authentication.
 *
 * @param app
 * ExpressJS app that is requesting access to the LinkedIn API.
 *
 * @param route
 * URL path that we want to register with 'app' to handle callbacks from
 * step 1 (if the app is successfully authorized to access LinkedIn). 
 *
 * @param handleResponse
 * Function to execute after opening connection to LinkedIn API.
 */
function acquireAccessToken(linkedinAuthMgr, app, route, handleResponse) 
{
	app.get(route, function(req, res) {
		linkedinAuthMgr.auth.getAccessToken(
			res, req.query.code, req.query.state,
			function(err, results) {
				if (err) { 
					throw err; 
				}
				// Save connection to LinkedIn API.
				exports.linkedin = linkedinAuthMgr.init(results.access_token);
				return handleResponse(req, res);
			}
		);
	});
}

// Initially, there's no connection to LinkedIn API.
exports.linkedin = null;

/**
 * @param apiConfigFile
 * JSON file containing required LinkedIn API settings.
 * Structured as follows:
 *		{
 *			"apiKey": "",
 *			"secret": "",
 *			"email": "",
 *			"password": "",
 *			"callbackUrl": "",
 *			"scope": [""]
 *		}
 *
 * @param app
 * ExpressJS app that is requesting access to the LinkedIn API.
 *
 * @param route
 * URL path that we want to register with 'app' to handle callbacks from
 * step 1 (if the app is successfully authorized to access LinkedIn). 
 *
 * @param handleResponse
 * Function to execute after opening connection to LinkedIn API.
 */
exports.run = function(apiConfigFile, app, handleResponse) {
	var apiConfig = require('jsonfile').readFileSync(apiConfigFile);

	var linkedinAuthMgr = require('node-linkedin')(apiConfig.apiKey, 
		apiConfig.secret, apiConfig.callbackUrl);
	var route = require('url').parse(apiConfig.callbackUrl).path;

	authorize(linkedinAuthMgr, apiConfig.email, apiConfig.password, 
		apiConfig.scope);
	acquireAccessToken(linkedinAuthMgr, app, route, handleResponse);
};
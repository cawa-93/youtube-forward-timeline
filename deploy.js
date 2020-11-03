const fs = require('fs');
const deploy = require('firefox-extension-deploy');

const manifest = JSON.parse(fs.readFileSync('./src/manifest.json', {encoding: 'utf8'}));

deploy({
	// obtained by following the instructions here:
	// https://addons-server.readthedocs.io/en/latest/topics/api/auth.html
	// or from this page:
	// https://addons.mozilla.org/en-US/developers/addon/api/key/
	issuer: process.env.FIREFOX_ISSUER,
	secret: process.env.FIREFOX_SECRET,

	// the ID of your extension
	id: '{40ab1417-ef94-48d7-8726-6abe7d07b123}',

	// the version to publish
	version: manifest.version,

	// a ReadStream containing a .zip (WebExtensions) or .xpi (Add-on SDK)
	src: fs.createReadStream('dist/latest.zip'),
}).catch(function(err) {
	console.error(err);
	process.exit(1);
});

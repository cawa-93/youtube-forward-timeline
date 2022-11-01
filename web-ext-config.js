const {resolve} = require('path');
module.exports = {
	verbose: false,

	sourceDir: resolve(__dirname, './src'),
	artifactsDir: resolve(__dirname, './dist'),

	// filename: 'latest.zip',

	build: {
		overwriteDest: true,
	},

	run: {
		startUrl: ['https://www.youtube.com/watch?v=dLeIhrpQ1Lg'],
		browserConsole: false,
	},

};

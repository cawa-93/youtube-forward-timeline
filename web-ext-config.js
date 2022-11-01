const {resolve} = require('path');
module.exports = {
	verbose: false,

	sourceDir: resolve(__dirname, './src'),
	artifactsDir: resolve(__dirname, './dist'),


	build: {
		filename: 'latest.zip',
		overwriteDest: true,
	},

	run: {
		startUrl: ['https://www.youtube.com/watch?v=dLeIhrpQ1Lg'],
		browserConsole: false,
	},

};

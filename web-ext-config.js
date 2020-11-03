const {resolve} = require('path');
module.exports = {
	verbose: false,

	sourceDir: resolve(__dirname, './src'),
	artifactsDir: resolve(__dirname, './dist'),

	filename: 'download.zip',

	build: {
		overwriteDest: true,
	},

	run: {
		startUrl: ['https://www.youtube.com/watch?v=RFTzqk7QG3U'],
		browserConsole: false,
	},

};

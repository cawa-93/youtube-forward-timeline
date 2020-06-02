/**
 *
 * @return {number[]}
 */
function getSections() {
	return Array
		.from(document.body.querySelectorAll('#description a[href*="' + location.search + '&t="]'))
		.map(a => {
			const u = new URL(a.href);
			const time = u.searchParams.get('t');
			return parseInt(time, 10);
		})
		.filter(t => !isNaN(t));
}


/**
 *
 * @param {number[]} times
 * @param {number} currentTime
 * @return {*}
 */
function getNextTime(times, currentTime) {
	return Math.min(...times.filter(t => t > currentTime));
}


function init() {
	const description = document.querySelector('#description');
	if (!description) {
		setTimeout(init, 500);
		return;
	}

	const times = getSections();
	if (!times || times.length < 2) {
		return;
	}

	const next = addButton();

	const video = document.body.querySelector('video');

	next.onclick = () => {
		const nextTime = getNextTime(times, video.currentTime);
		if (nextTime > video.currentTime && nextTime < video.duration) {
			video.currentTime = nextTime;
		}
	};
}


function addButton() {
	let next = document.body.querySelector('#next-timeline');
	if (next) {
		return next;
	}

	const play = document.body.querySelector('.ytp-play-button');
	next = document.createElement('button');
	next.id = 'next-timeline';
	next.className = 'ytp-button';
	next.style.cssText = '    display: inline-flex;\n'
	                     + '    justify-content: center;\n'
	                     + '    align-items: center;\n'
	                     + 'transform: translateY(-5px);';
	next.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" fill="#ffffff"/></svg>`;

	play.insertAdjacentElement('afterend', next);
	return next;
}


init();

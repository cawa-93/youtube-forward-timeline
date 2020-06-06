/**
 *
 * @return {number[]}
 */
function getSections(description) {
	const id = new URL(location.href).searchParams.get('v');
	return Array
		.from(description.querySelectorAll('a[href*="/watch"][href*="t="][href*="v=' + id + '"]'))
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
	if (location.pathname !== '/watch') {
		return;
	}

	const description = document.querySelector('#description');

	if (!description || description.textContent.trim() === '') {
		setTimeout(init, 100);
		return;
	}

	const times = getSections(description);

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
	next.style.cssText = 'display: inline-flex;'
	                     + 'justify-content: center;'
	                     + 'align-items: center;'
	                     + 'vertical-align: top';

	next.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="width: auto;height: 65%;" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" fill="#ffffff"/></svg>`;

	play.insertAdjacentElement('afterend', next);
	return next;
}


init();

let runOnPath;
const mainObserver = new MutationObserver(() => {
	if (runOnPath === location.pathname) {
		return;
	} else {
		runOnPath = location.pathname;
	}

	init()
});
const observerConfig = {attributes: true, subtree: true, childList: true};
mainObserver.observe(document, observerConfig);

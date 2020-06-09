const app = document.body.querySelector('ytd-app');


/**
 *
 * @param {HTMLElement} description
 * @return {number[]}
 */
function getChapters(description) {
	const id = new URL(location.href).searchParams.get('v');
	return Array
		.from(description.querySelectorAll('a[href*="/watch"][href*="t="][href*="v=' + id + '"]'))
		.map(a => {
			const u = new URL(a.href);
			const time = u.searchParams.get('t');
			return parseInt(time, 10);
		})
		.filter(t => !isNaN(t) && t > 0);
}


/**
 *
 * @param {number[]} times
 * @param {number} currentTime
 * @return {number}
 */
function getClosestChapter(times, currentTime) {
	return Math.min(...times.filter(t => t > currentTime));
}


/**
 *
 * @return {Promise<HTMLElement>}
 */
function descriptionLoaded() {
	return new Promise(resolve => {
		let intervalId = setInterval(() => {

			/**
			 *
			 * @type {HTMLElement}
			 */
			const description = app.querySelector('#description');
			if (description && description.textContent.trim() !== '') {
				clearInterval(intervalId);
				resolve(description);
			}

		}, 500);
	});
}


/**
 *
 * @return {HTMLButtonElement}
 */
function getNextChapterButton() {
	let next = app.querySelector('#next-timeline');
	if (next) {
		return next;
	}

	const play = app.querySelector('.ytp-play-button');
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


/**
 *
 * @return {Promise<void>}
 */
async function main() {
	const isWatchPage = app.hasAttribute('is-watch-page');
	if (!isWatchPage) {
		return;
	}

	const description = await descriptionLoaded();

	const times = getChapters(description);

	if (!times.length) {
		return;
	}

	const video = app.querySelector('#ytd-player video');

	const nextChapterButton = getNextChapterButton();

	nextChapterButton.onclick = () => {
		const nextTime = getClosestChapter(times, video.currentTime);
		if (nextTime > video.currentTime && nextTime < video.duration) {
			video.currentTime = nextTime;
		}
	};
}


main().catch(console.error);
const mainObserver = new MutationObserver(main);
mainObserver.observe(app, {attributeFilter: ['is-watch-page']});

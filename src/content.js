/**
 * @param {number} t
 * @return {Promise<void>}
 */
function wait(t) {
	return new Promise(r => setTimeout(r, t));
}


/**
 * @return {Promise<HTMLElement>}
 */
async function getApp() {
	while (true) {

		/** @type {HTMLElement} */
		const app = document.body.querySelector('#content ytd-watch-flexy');

		if (app !== null) {
			return app;
		}

		await wait(100);
	}
}


getApp().then(app => {

	/**
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
	 * @param {number[]} times
	 * @param {number} currentTime
	 * @return {number}
	 */
	function getClosestChapter(times, currentTime) {
		return Math.min(...times.filter(t => t > currentTime));
	}


	/**
	 * @return {Promise<HTMLElement>}
	 */
	async function descriptionLoaded() {
		while (true) {
			/** @type {HTMLElement} */
			const description = app.querySelector('#description');
			if (description !== null && description.textContent.trim() !== '') {
				return description;
			}
			await wait(100);
		}
	}


	/**
	 * @return {HTMLButtonElement}
	 */
	function createNextChapterButton() {
		let next = app.querySelector('#next-timeline');
		if (next) {
			return next;
		}

		next = document.createElement('button');
		next.id = 'next-timeline';
		next.className = 'ytp-button';
		next.style.cssText = 'display: inline-flex;'
		                     + 'justify-content: center;'
		                     + 'align-items: center;'
		                     + 'vertical-align: top';

		next.innerHTML = `<svg style="width: auto;height: 65%;" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" fill="#ffffff"/></svg>`;

		const spanWrapper = document.createElement('span');
		spanWrapper.appendChild(next);

		const controlsContainer = app.querySelector('.ytp-left-controls');

		if (!controlsContainer) {
			throw new Error(`Can't find .ytp-left-controls`);
		}

		/** @type {HTMLElement} */
		let playButtonContainer = app.querySelector('.ytp-play-button');

		while (playButtonContainer.parentElement !== controlsContainer) {
			playButtonContainer = playButtonContainer.parentElement;
		}

		playButtonContainer.insertAdjacentElement('afterend', spanWrapper);
		return next;
	}


	function removeNextChapterButton() {
		let next = app.querySelector('#next-timeline');
		if (next) {
			next.remove();
		}
	}


	/**
	 * @return {Promise<void>}
	 */
	async function main() {
		const isWatchPage = app.hasAttribute('video-id') && !app.hidden;

		if (!isWatchPage) {
			removeNextChapterButton();
			return;
		}

		const description = await descriptionLoaded();

		const times = getChapters(description);
		if (!times.length) {
			removeNextChapterButton();
			return;
		}

		const video = app.querySelector('#ytd-player video');

		const nextChapterButton = createNextChapterButton();

		nextChapterButton.onclick = () => {
			const nextTime = getClosestChapter(times, video.currentTime);
			if (nextTime > video.currentTime && nextTime < video.duration) {
				video.currentTime = nextTime;
			}
		};
	}


	main().catch(console.error);
	const mainObserver = new MutationObserver(main);
	mainObserver.observe(app, {attributeFilter: ['video-id', 'hidden']});
});

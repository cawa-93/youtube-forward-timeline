/**
 * @param {number} t
 * @return {Promise<void>}
 */
function wait(t) {
    return new Promise(r => setTimeout(r, t));
}

// console.log('ЗАПУСК')

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

/**
 *
 * @param {string} selector
 * @param {HTMLElement} container
 * @param {number} timeout
 * @param {number} limit
 * @param {(element: HTMLElement) => boolean} validate
 * @returns {Promise<HTMLElement>}
 */
async function waitElement(selector, container, timeout = 100, limit = Infinity, validate = () => true) {
    while (limit > 0) {
    // console.log('SEARCH', selector)
        /** @type {HTMLElement} */
        const element = container.querySelector(selector);
        if (element !== null && validate(element)) {
            return element;
        }

        limit -= timeout

        await wait(timeout);
    }
}


getApp().then(/** @type {HTMLElement} */app => {

    // console.log('getApp')

    /**
     * @return {Promise<HTMLElement>}
     */
    function descriptionLoaded() {
        return waitElement('#description.ytd-expandable-video-description-body-renderer[slot="content"]', app, 100, Infinity, element => element.textContent.trim() !== '')
    }


    /**
     * @param {HTMLElement} el
     * @return {number[]}
     */
    function findChapters(el) {
        const id = new URL(location.href).searchParams.get('v');
        return Array
            .from(el.querySelectorAll('a[href*="/watch"][href*="t="][href*="v=' + id + '"]'))
            .map(a => {
                const u = new URL(a.href);
                const time = u.searchParams.get('t');
                return parseInt(time, 10);
            })
            .filter(t => !isNaN(t) && t > 0);
    }

    /**
     * @return {Promise<number[]>}
     */
    async function getChapters() {
        // console.log('getChapters')

        const markersList = document.querySelector('ytd-macro-markers-list-renderer')
        // console.log({markersList})
        let chapters = []
        if (markersList) {
            chapters = findChapters(markersList)
        }

        // If no chapters in "chapters" widget search it in regular description
        if (chapters.length === 0) {
            const description = await descriptionLoaded()
            chapters = findChapters(description)
        }

		return chapters
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
     * @return {HTMLButtonElement}
     */
    async function createNextChapterButton() {
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

        const controlsContainer = await waitElement('.ytp-left-controls', app);

        if (!controlsContainer) {
            throw new Error(`Can't find .ytp-left-controls`);
        }

        let playButtonContainer = await waitElement('.ytp-play-button', app);

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
        // console.log('main');
        const isWatchPage = app.hasAttribute('video-id') && !app.hidden;
        // console.log({isWatchPage});

        if (!isWatchPage) {
            removeNextChapterButton();
            return;
        }

        const times = await getChapters();
        // console.log({times});
        if (!times.length) {
            removeNextChapterButton();
            return;
        }



        const nextChapterButton = await createNextChapterButton();
        // console.log({nextChapterButton});

        const video = await waitElement('#ytd-player video', app);
        // console.log({video});
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

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


getApp().then(/** @type {HTMLElement} */app => {


    /**
     * @return {Promise<HTMLElement>}
     */
    async function descriptionLoaded() {
        while (true) {
            // console.log({struct: document.querySelectorAll('#structured-description')})
            /** @type {HTMLElement} */
            const description = app.querySelector('#description.ytd-expandable-video-description-body-renderer[slot="content"]');
            if (description !== null && description.textContent.trim() !== '') {
                return description;
            }
            await wait(100);
        }
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
     * @param {HTMLElement} description
     * @return {Promise<number[]>}
     */
    async function getChapters() {
        const markersList = document.querySelector('ytd-macro-markers-list-renderer')
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

        const times = await getChapters();
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

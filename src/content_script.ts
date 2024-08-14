import { BlockedUrl, getBlockedUrls } from "./popup";

(async () => {
    const blockedUrls = await getBlockedUrls();
    blockedUrls.forEach(async ({ url }: BlockedUrl) => {
        if (window.location.href.indexOf(url) !== -1) {
            const response = await fetch(chrome.runtime.getURL("page.html"));
            const html = new DOMParser().parseFromString(
                await response.text(),
                "text/html"
            );
            document.body.innerHTML = html.body.innerHTML;
        }
    });
})();

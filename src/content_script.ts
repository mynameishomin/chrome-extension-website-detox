import { getBlockedUrls } from "./storage";
import { BlockedUrl } from "./type";

(async () => {
    const blockedUrls = await getBlockedUrls();
    blockedUrls.forEach(async ({ url }: BlockedUrl) => {
        if (window.location.href.indexOf(url) !== -1) {
            const response = await fetch(chrome.runtime.getURL("blocked.html"));
            const html = new DOMParser().parseFromString(
                await response.text(),
                "text/html"
            );
            document.body.innerHTML = html.body.innerHTML;
        }
    });
})();

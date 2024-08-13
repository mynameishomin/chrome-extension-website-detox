import { BlockedUrl, getBlockedUrls } from "./popup";

(async () => {
    const blockedUrls = await getBlockedUrls();
    blockedUrls.forEach(async ({ url, id }: BlockedUrl) => {
        if (window.location.host === url) {
            const response = await fetch(chrome.runtime.getURL("page.html"));
            const html = new DOMParser().parseFromString(
                await response.text(),
                "text/html"
            );
            document.body.innerHTML = html.body.innerHTML;
        } else {
            console.log(window.location.host, url);
            console.log("불일치");
        }
    });
})();

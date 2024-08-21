import { getBlockedUrls, getOptions, setTempUnblock } from "./storage";
import { BlockedUrl } from "./type";

(async () => {
    const options = await getOptions();
    if (!options.enable) return false;

    if (options.tempUnblock) {
        setTempUnblock(false);
        return false;
    }
    const blockedUrls = await getBlockedUrls();
    blockedUrls.forEach(async ({ url }: BlockedUrl) => {
        if (window.location.href.indexOf(url) !== -1) {
            await appendBlockedHtml();

            const tempUnblockButton =
                document.querySelector("#tempUnblockButton");
            const blockedUrl = document.querySelector("#blockedUrl");
            if (!(tempUnblockButton && blockedUrl)) return false;
            blockedUrl.textContent = url;
            tempUnblockButton.addEventListener("click", async () => {
                await setTempUnblock(true);
                window.location.reload();
            });
        }
    });
})();

const appendBlockedHtml = async () => {
    const response = await fetch(chrome.runtime.getURL("blocked.html"));
    const html = new DOMParser().parseFromString(
        await response.text(),
        "text/html"
    );
    document.body.innerHTML = html.body.innerHTML;
};

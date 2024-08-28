import {
    getBlockedUrls,
    getOptions,
    setEnableStartedTime,
    setEnableStatus,
} from "./storage";
import { BlockedUrl } from "./type";

(async () => {
    const options = await getOptions();

    const { startedTime, endTime, status } = options.enable;
    if (!status) return false;

    const lastTime = Date.now() - (startedTime as number);
    if (endTime && endTime < lastTime) {
        await setEnableStatus(false);
        await setEnableStartedTime(null);
        return false;
    }

    const blockedUrls = await getBlockedUrls();
    blockedUrls.forEach(async ({ url }: BlockedUrl) => {
        if (window.location.href.indexOf(url) !== -1) {
            window.location.href = chrome.runtime.getURL("popup.html");
        }
    });
})();

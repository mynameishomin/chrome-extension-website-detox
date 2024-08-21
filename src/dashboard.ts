import { getBlockedUrls } from "./storage";

(async () => {
    const blockedUrls = await getBlockedUrls();
    console.log(blockedUrls);
})();

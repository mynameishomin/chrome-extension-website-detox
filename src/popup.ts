import {
    addBlockedUrl,
    deleteBlockedUrl,
    getBlockedUrls,
    getOptions,
    setEnable,
} from "./storage";
import { BlockedUrl } from "./type";

const createUrlElement = ({ url, id }: BlockedUrl) => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    const span = document.createElement("span");
    const button = document.createElement("button");

    span.textContent = url;
    img.src = `https://${url}/favicon.ico`;
    img.addEventListener("error", () => {
        img.src = "/src/images/default-favicon.ico";
    });
    button.textContent = "❌";

    button.addEventListener("click", async () => {
        if (confirm(`${url}을 차단 목록에서 지우시겠습니까?`)) {
            await deleteBlockedUrl(id);
            li.remove();
        }
    });

    li.appendChild(img);
    li.appendChild(span);
    li.appendChild(button);
    return li;
};

const urlPattern = /^([\w\d\.-]+)\.([a-z\.]{2,6})(:[0-9]{1,5})?(\/[^\s]*)?$/;
const checkUrlPattern = (url: string) => {
    return urlPattern.test(url);
};

(async () => {
    const options = await getOptions();
    const urlForm = document.querySelector("#urlForm");
    const urlInput =
        (document.querySelector("#urlInput") as HTMLInputElement) || null;
    const urlCheckMessage = document.querySelector("#urlCheckMessage");
    const enableCheckbox =
        (document.querySelector("#enableCheckbox") as HTMLInputElement) || null;
    const dashboard = document.querySelector("#dashboard");

    if (dashboard) {
        dashboard.addEventListener("click", () => {
            const url = chrome.runtime.getURL("dashboard.html");
            chrome.tabs.create({ url });
        });
    }

    if (enableCheckbox) {
        enableCheckbox.checked = options.enable || false;
        enableCheckbox.addEventListener("change", async () => {
            setEnable(enableCheckbox.checked);
        });
    }

    if (urlInput && urlCheckMessage) {
        urlInput.addEventListener("focus", () => {
            urlCheckMessage.textContent = "";
        });
    }

    if (urlForm && urlCheckMessage) {
        urlForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const url = urlInput.value;
            const isUrl = checkUrlPattern(url);

            if (isUrl) {
                const urlData = await addBlockedUrl(url);
                const urlElement = createUrlElement(urlData);
                blockedUrlList?.appendChild(urlElement);
                blockedUrlList?.scrollTo(0, blockedUrlList.scrollHeight);

                urlInput.value = "";
                urlCheckMessage.textContent = "";
            } else {
                urlCheckMessage.textContent = "올바른 url을 입력해주세요.";
            }
        });
    }

    const blockedUrlList = document.querySelector("#blockedUrlList");

    const blockedUrls = await getBlockedUrls();
    if (blockedUrls.length) {
        blockedUrls.forEach((urlData) => {
            const urlElement = createUrlElement(urlData);
            blockedUrlList?.appendChild(urlElement);
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "url이 없습니다.";
        blockedUrlList?.appendChild(li);
    }
})();

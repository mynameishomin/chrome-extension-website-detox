import {
    addBlockedUrl,
    deleteBlockedUrl,
    getBlockedUrls,
    getOptions,
    setEnable,
} from "./storage";
import { ValueCell } from "./value_cell";
import { BlockedUrl } from "./type";

const querySelector = <T extends Element>(selector: string) => {
    const element = document.querySelector(selector) as T | null;
    if (!element) throw new Error(`${selector}를 찾을 수 없습니다.`);
    return element;
};

const urlPattern = /^([\w\d\.-]+)\.([a-z\.]{2,6})(:[0-9]{1,5})?(\/[^\s]*)?$/;
const checkUrlPattern = (url: string) => {
    return urlPattern.test(url);
};

(async () => {
    const options = await getOptions();

    const enableAnimation = querySelector<HTMLDivElement>("#enableAnimation");
    const enableCheckbox = querySelector<HTMLInputElement>("#enableCheckbox");
    const enableStatus = ValueCell<boolean>(false);
    const enableStartTime = ValueCell<number | null>(options.enable.startTime);

    enableStatus.addWatcher((value) => {
        setEnable(value);
        enableAnimation.classList.toggle("on", value);
        enableCheckbox.checked = value;

        if (value) {
            // leftTime.innerText = String(options.enable.startTime);
        } else {
            leftTime.innerText = "0:00";
            endTime.innerText = "0:00";
        }
    });
    enableCheckbox.addEventListener("change", () => {
        enableStatus.update(() => enableCheckbox.checked);
    });
    enableStatus.update(() => options.enable.status);

    const urlForm = querySelector<HTMLFormElement>("#urlForm");
    const urlInput = querySelector<HTMLInputElement>("#urlInput");
    const urlCheckMessage = querySelector<HTMLSpanElement>("#urlCheckMessage");

    const leftTime = querySelector<HTMLSpanElement>("#leftTime");
    const endTime = querySelector<HTMLSpanElement>("#endTime");

    urlInput.addEventListener("focus", () => {
        urlCheckMessage.textContent = "";
    });

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

    const blockedUrlList = querySelector<HTMLUListElement>("#blockedUrlList");
    const blockedUrls = ValueCell<BlockedUrl[]>([]);
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
    blockedUrls.addWatcher((urls) => {
        urls.forEach((urlData) => {
            const urlElement = createUrlElement(urlData);
            blockedUrlList?.appendChild(urlElement);
        });
    });
    const storedBlockedUrls = await getBlockedUrls();
    blockedUrls.update(() => storedBlockedUrls);
})();

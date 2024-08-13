import { getStorage, setStorage } from "./storage";

export interface BlockedUrl {
    url: string;
    id: number;
}

export const getBlockedUrls = async () => {
    return (await getStorage<BlockedUrl[]>("blockedUrls")) || [];
};

const addBlockedUrl = async (url: string) => {
    const blockedUrls = await getBlockedUrls();
    const urlData = { url, id: Date.now() };
    blockedUrls.push(urlData);
    await setStorage({ blockedUrls });
    return urlData;
};

const deleteBlockedUrl = async (id: number) => {
    const blockedUrls = await getBlockedUrls();
    const urlIndex = blockedUrls.findIndex((obj) => obj.id === id);
    blockedUrls.splice(urlIndex, urlIndex + 1);
    setStorage({ blockedUrls });
};

const createUrlElement = ({ url, id }: BlockedUrl) => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    const span = document.createElement("span");
    const button = document.createElement("button");

    span.textContent = url;
    img.src = `https://${url}/favicon.ico`;
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
    const saveUrlButton = document.querySelector("#saveUrlButton");
    const urlInput =
        (document.querySelector("#urlInput") as HTMLInputElement) || null;
    const urlCheckMessage = document.querySelector("#urlCheckMessage");

    if (!(saveUrlButton && urlInput && urlCheckMessage)) return false;

    urlInput.addEventListener("focus", () => {
        urlCheckMessage.textContent = "";
    });

    saveUrlButton.addEventListener("click", async () => {
        const url = urlInput.value;
        const isUrl = checkUrlPattern(url);

        if (isUrl) {
            const urlData = await addBlockedUrl(url);
            const urlElement = createUrlElement(urlData);
            blockedUrlList?.appendChild(urlElement);
        } else {
            urlCheckMessage.textContent = "올바른 url을 입력해주세요.";
        }
    });

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

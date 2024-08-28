import {
    getBlockedUrls,
    getOptions,
    setBlockedUrls,
    setEnableEndTime,
    setEnableStartedTime,
    setEnableStatus,
    setOptions,
} from "./storage";
import { ValueCell } from "./value_cell";
import { BlockedUrl } from "./type";
import {
    normalizeUrl,
    querySelector,
    formatMillisecondsToMinutesAndSeconds,
} from "./utility";

const $timeProgressBar = querySelector<HTMLDivElement>("#timeProgressBar");

(async () => {
    const drawTimeProgressBar = () => {
        const startedTime = enableStartedTime.val();
        const endTime = enableEndTime.val();
        const nowTime = Date.now();
        const statue = enableStatus.val();

        if (!startedTime || !endTime || !statue) {
            $timeProgressBar.style.width = "0%";
            return false;
        }

        const lastTime = nowTime - startedTime;
        const lastPercent = (lastTime / endTime) * 100;

        $timeProgressBar.style.width = `${lastPercent}%`;
    };

    const drawLeftTime = () => {
        drawTimeProgressBar();
        const leftTime = Date.now() - (enableStartedTime.val() as number);
        $leftMinutesAndSeconds.innerText =
            formatMillisecondsToMinutesAndSeconds(leftTime);
    };

    const options = await getOptions();
    const enableAnimation = querySelector<HTMLDivElement>("#enableAnimation");
    const enableCheckbox = querySelector<HTMLInputElement>("#enableCheckbox");
    const $leftMinutesAndSeconds = querySelector<HTMLSpanElement>(
        "#leftMinutesAndSeconds"
    );

    const enableStatus = ValueCell<boolean>(false);
    const enableStartedTime = ValueCell<number | null>(
        options.enable.startedTime
    );

    enableStartedTime.addWatcher((value) => {
        setEnableStartedTime(value);
        drawTimeProgressBar();
    });

    enableStatus.addWatcher(
        (() => {
            let secondsInterval: number;
            return async (value) => {
                await setEnableStatus(value);
                enableAnimation.classList.toggle("on", value);
                enableCheckbox.checked = value;

                if (value && !enableStartedTime.val()) {
                    enableStartedTime.update(() => Date.now());
                }

                if (value) {
                    drawLeftTime();
                    secondsInterval = setInterval(() => drawLeftTime(), 1000);
                } else {
                    clearInterval(secondsInterval);
                    enableStartedTime.update(() => null);
                    $leftMinutesAndSeconds.innerText =
                        formatMillisecondsToMinutesAndSeconds(null);
                }
            };
        })()
    );

    enableStatus.update(() => options.enable.status);
    enableCheckbox.addEventListener("change", () => {
        enableStatus.update(() => enableCheckbox.checked);
    });

    const $endMinutesAndSeconds = querySelector<HTMLSpanElement>(
        "#endMinutesAndSeconds"
    );
    const $decreaseEndTime =
        querySelector<HTMLButtonElement>("#decreaseEndTime");
    const $increaseEndTime =
        querySelector<HTMLButtonElement>("#increaseEndTime");
    const enableEndTime = ValueCell<number | null>(null);
    const endTimeUnit = 1000 * 60 * 30;

    enableEndTime.addWatcher((value) => {
        drawTimeProgressBar();
        setEnableEndTime(value);
        $endMinutesAndSeconds.innerText =
            formatMillisecondsToMinutesAndSeconds(value);
    });
    $decreaseEndTime.addEventListener("click", () => {
        enableEndTime.update((endTime) => {
            if (!endTime) return null;
            const targetTime = enableStatus.val()
                ? Date.now()
                : (enableStartedTime.val() as number);
            const decreasedEndTime = endTime - endTimeUnit + targetTime;

            if (decreasedEndTime < targetTime) {
                return null;
            }
            return decreasedEndTime - targetTime;
        });
    });
    $increaseEndTime.addEventListener("click", () => {
        enableEndTime.update((value) => {
            return value ? value + endTimeUnit : endTimeUnit;
        });
    });
    enableEndTime.update(() => options.enable.endTime);

    const urlForm = querySelector<HTMLFormElement>("#urlForm");
    const urlInput = querySelector<HTMLInputElement>("#urlInput");

    urlForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = normalizeUrl(urlInput.value);

        if (!url) {
            alert("올바른 URL을 입력하세요");
            return false;
        }

        const index = blockedUrls
            .val()
            .findIndex((blockedUrl) => blockedUrl.url === url);

        if (index !== -1) {
            alert("똑같은 URL이 있습니다");
            return false;
        }

        const urlData: BlockedUrl = { id: Date.now(), url };
        blockedUrls.update((urls) => [...(urls || []), urlData]);
        urlInput.value = "";
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
                blockedUrls.update((urls) => {
                    if (!urls) return [];

                    const index = urls?.findIndex(
                        (urlData) => urlData.id === id
                    );
                    urls.splice(index, 1);
                    return [...urls];
                });
            }
        });

        li.appendChild(img);
        li.appendChild(span);
        li.appendChild(button);
        return li;
    };
    blockedUrls.addWatcher((urls) => {
        setBlockedUrls(urls);
        blockedUrlList.innerHTML = "";
        urls.forEach((urlData) => {
            const urlElement = createUrlElement(urlData);
            blockedUrlList.appendChild(urlElement);
        });
        blockedUrlList.scrollTo(0, blockedUrlList.scrollHeight);
    });
    const storedBlockedUrls = await getBlockedUrls();
    blockedUrls.update(() => storedBlockedUrls);
})();

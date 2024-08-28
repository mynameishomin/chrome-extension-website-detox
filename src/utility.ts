export const normalizeUrl = (url: string) => {
    const urlPattern =
        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9.-]+)\.([a-z]{2,})(\/.*)?$/;
    const match = url.match(urlPattern);
    if (match) {
        const domain = match[3];
        const tld = match[4];
        return `www.${domain}.${tld}`;
    }
    return null;
};

export const querySelector = <T extends Element>(selector: string) => {
    const element = document.querySelector(selector) as T | null;
    if (!element) throw new Error(`${selector}를 찾을 수 없습니다.`);
    return element;
};

export const formatMillisecondsToMinutesAndSeconds = (ms: number | null) => {
    if (!ms) return "--:--";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = seconds.toString().padStart(2, "0");
    return `${minutes}:${formattedSeconds}`;
};

import { BlockedUrl, Options } from "./type";

export const getStorage = <T>(key: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
};

export const setStorage = (data: { [key: string]: any }): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(data, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
};

export const getBlockedUrls = async () => {
    return (await getStorage<BlockedUrl[]>("blockedUrls")) || [];
};

export const addBlockedUrl = async (url: string) => {
    const blockedUrls = await getBlockedUrls();
    const urlData = { url, id: Date.now() };
    blockedUrls.push(urlData);
    await setStorage({ blockedUrls });
    return urlData;
};

export const deleteBlockedUrl = async (id: number) => {
    const blockedUrls = await getBlockedUrls();
    const urlIndex = blockedUrls.findIndex((obj) => obj.id === id);
    blockedUrls.splice(urlIndex, urlIndex + 1);
    setStorage({ blockedUrls });
};

export const getOptions = async () => {
    return (await getStorage<Options>("options")) || {};
};

export const setOptions = async (newOptions: Options) => {
    const savedOptions = await getOptions();
    console.log(savedOptions);
    const options = Object.assign(savedOptions, newOptions);
    setStorage({ options });
};

export const setEnable = async (enable: boolean) => {
    setOptions({ enable });
};

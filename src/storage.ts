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

export const setBlockedUrls = async (blockedUrls: BlockedUrl[]) => {
    await setStorage({ blockedUrls });
};

export const addBlockedUrl = async (url: string) => {
    const blockedUrls = await getBlockedUrls();
    const urlData = { url, id: Date.now() };
    blockedUrls.push(urlData);
    await setStorage({ blockedUrls });
    return urlData as BlockedUrl;
};

export const deleteBlockedUrl = async (id: number) => {
    const blockedUrls = await getBlockedUrls();
    const urlIndex = blockedUrls.findIndex((obj) => obj.id === id);
    blockedUrls.splice(urlIndex, urlIndex + 1);
    setStorage({ blockedUrls });
};

export const getOptions = async () => {
    return (
        (await getStorage<Options>("options")) || {
            enable: {
                status: false,
                startedTime: null,
                endTime: null,
            },
        }
    );
};

export const setOptions = async (newOptions: Options) => {
    const savedOptions = await getOptions();
    const options = Object.assign(savedOptions, newOptions);
    await setStorage({ options });
    return options;
};

const createOptionModifier = <T>(
    optionModifier: (option: Options, value: T) => Options
) => {
    return async (value: T) => {
        const options = await getOptions();
        const modifiedOptions = optionModifier(options, value);
        await setOptions(modifiedOptions);
        return value;
    };
};

export const setEnableStatus = createOptionModifier<boolean>(
    (options, value) => {
        options.enable.status = value;
        return options;
    }
);

export const setEnableStartedTime = createOptionModifier<number | null>(
    (options, value) => {
        options.enable.startedTime = value;
        return options;
    }
);

export const setEnableEndTime = createOptionModifier<number | null>(
    (options, value) => {
        options.enable.endTime = value;
        return options;
    }
);

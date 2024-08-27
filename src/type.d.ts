export interface BlockedUrl {
    url: string;
    id: number;
}

export interface Options {
    enable: {
        status: boolean;
        startTime: number | null;
    };
    tempUnblock: boolean;
}

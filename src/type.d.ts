export interface BlockedUrl {
    url: string;
    id: number;
}

export interface Options {
    enable: {
        status: boolean;
        startedTime: number | null;
        endTime: number | null;
    };
}

type watcher<T> = (newValue: T) => void;
type updater<T> = (oldValue?: T) => T;

export const ValueCell = <T>(initalValue: T) => {
    let currentValue = initalValue;
    const watchers: watcher<T>[] = [];
    return {
        val: function () {
            return currentValue;
        },
        update: function (f: updater<T>) {
            const oldValue = currentValue;
            const newValue = f(oldValue);
            if (oldValue !== newValue) {
                currentValue = newValue;
                watchers.forEach((watcher) => {
                    watcher(newValue);
                });
            }
        },
        addWatcher: function (f: watcher<T>) {
            watchers.push(f);
        },
    };
};

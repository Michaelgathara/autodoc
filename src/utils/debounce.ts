export class Debouncer {
    private _timer: NodeJS.Timeout | undefined;
    private _delay: number;

    constructor(delay: number) {
        this._delay = delay;
    }

    debounce(callback: () => Promise<void> | void): Promise<void> {
        return new Promise((resolve) => {
            if (this._timer) {
                clearTimeout(this._timer);
            }

            this._timer = setTimeout(async () => {
                await callback();
                resolve();
            }, this._delay);
        });
    }
}


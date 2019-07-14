import { ScheduledCallback } from "./Scheduler";

/**
 * Util for starting and stopping a ticking update.
 * 
 * When running, will trigger the given callback at the given interval.
 */
export class Ticker {
    private _interval: number;
    private _callback: ScheduledCallback;
    
    private _handle: number;

    constructor(interval: number, callback: ScheduledCallback, scope?: any) {
        this._interval = interval;
        this._handle = 0;

        if (scope) {
            this._callback = callback.bind(scope);
        } else {
            this._callback = callback;
        }
    }

    public start(): void {
        if (!this._handle) {
            console.log("Starting ticker");

            this._handle = window.setInterval(this._callback, this._interval);
        }
    }
    
    public stop(): void {
        if (this._handle) {
            console.log("Stopping ticker");

            clearInterval(this._handle);
            this._handle = 0;
        }
    }
}

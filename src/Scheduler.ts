export type ScheduledCallback = () => void;

interface ScheduledEvent {
    timestamp: number;
    callback: ScheduledCallback;
}

/**
 * Util for scheduling future events
 * 
 * Can schedule callbacks to be called at a given timestamp, or after a given delay.
 */
export class Scheduler {
    private _events: ScheduledEvent[];
    
    private _handle: number;

    constructor() {
        this._events = [];
        this._handle = 0;

        this.onEvent = this.onEvent.bind(this);
    }

    public registerAlarm(timestamp: number, callback: ScheduledCallback, scope?: any): void {
        this._events.push({
            timestamp,
            callback: scope ? callback.bind(scope) : callback
        });
        this.refresh();
    }
    
    public registerTimeout(delay: number, callback: ScheduledCallback, scope?: any): void {
        this._events.push({
            timestamp: Date.now() + delay,
            callback: scope ? callback.bind(scope) : callback
        });
        this.refresh();
    }

    private refresh(): void {
        if (this._handle) {
            clearInterval(this._handle);
            this._handle = 0;
        }
        
        if (this._events.length > 0) {
            this._events.sort((a, b) => a.timestamp - b.timestamp);
            this._handle = window.setTimeout(this.onEvent, Date.now() - this._events[0].timestamp);
        }
    }

    private onEvent(): void {
        const now = Date.now();
        const events = this._events;

        // Trigger any completed events
        let i = 0;
        for(; i<events.length && now>=events[i].timestamp; i++) {
            console.log("Triggering event", events[i].timestamp);
            events[i].callback();
        }
        events.splice(0, i);

        // Clear callback, schedule callback for next event
        this.refresh();
    }
}

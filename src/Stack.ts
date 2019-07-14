import { Ticker } from "./Ticker";
import { Toast } from "./Toast";
import { Point } from "openfin/_v2/api/system/point";
import { FPS, SCREEN_PADDING, Durations } from "./Constants";
import { Scheduler } from "./Scheduler";
import { MonitorInfo } from "openfin/_v2/api/system/monitor";

export class Stack {
    private _scheduler: Scheduler;
    private _ticker: Ticker;
    private _stack: Toast[];

    private _anchor!: Point;

    constructor() {
        this._scheduler = new Scheduler();
        this._ticker = new Ticker(1000 / FPS, this.tick, this);
        this._stack = [];

        fin.System.addListener('monitor-info-changed', this.onMonitorChange.bind(this));
    }

    public get length(): number {
        return this._stack.length;
    }

    public get(index: number): Toast {
        return this._stack[index];
    }

    public async init(): Promise<void> {
        const info = await fin.System.getMonitorInfo();
        await this.onMonitorChange(info);
    }

    public async add(toast: Toast): Promise<void> {
        this._stack.push(toast);
        this._ticker.start();

        this._scheduler.registerTimeout(Durations.MAX_AGE, () => {
            toast.dismiss();
        });

        toast.onModified.add(() => {
            this._ticker.start();
        });
        toast.onClose.add(() => {
            this.remove(toast);
        });
    }

    private async remove(toast: Toast): Promise<void> {
        const index = this._stack.indexOf(toast);
        if (index >= 0) {
            this._stack.splice(index, 1);
            await toast.dismiss();
        }
    }

    private async onMonitorChange(info: MonitorInfo): Promise<void> {
        const bounds = info.primaryMonitor.availableRect;

        this._anchor = {
            x: bounds.right - SCREEN_PADDING,
            y: bounds.bottom - SCREEN_PADDING
        }
    }

    private tick(): void {
        let modified = false;
        const origin = {...this._anchor};
        const stack = this._stack;

        for(let i=stack.length-1; i>=0; i--) {
            const result = stack[i].update(origin, 0);
            modified = modified || result;
        }

        if (!modified) {
            this._ticker.stop();
        }
    }
}

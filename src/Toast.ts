import { Signal } from "./Signal";
import { Window } from "openfin/_v2/main";
import { Point } from "openfin/_v2/api/system/point";
import { Durations, TOAST_SPACING } from "./Constants";

export enum ToastState {
    /**
     * Active due to initial animation
     */
    TRANSITION_IN,

    /**
     * Notif is fully transitioned in, not yet expired, not currently correcting for anything
     */
    IDLE,

    /**
     * Notif is moving to accommodate a change in its size, or because of a notif elsewhere in the stack being closed
     */
    ACTIVE,

    /**
     * Notif has expired and is removing itself from the stack.
     * 
     * May trigger other animations to go from IDLE to ACTIVE
     */
    TRANSITION_OUT
}

export class Toast {
    public onClose: Signal = new Signal();
    // public onDismiss: Signal = new Signal();
    // public onResize: Signal<[Readonly<Point>]> = new Signal();
    public onModified: Signal = new Signal();

    private _window: Window;
    private _creationTime: number;
    private _dismissTime: number;
    
    private _state: ToastState;
    private _opacity: number;
    private _size: Point;
    private _isOpen: boolean;

    constructor(window: Window, size: Point) {
        this._window = window;
        this._creationTime = Date.now();
        this._dismissTime = 0;
        
        this._state = ToastState.TRANSITION_IN;
        this._opacity = 0;
        this._size = size;
        this._isOpen = true;

        window.addListener('closing', () => {
            this._isOpen = false;
        });
        window.addListener('closed', () => {
            this.onClose.emit();
            this.onModified.emit();
        });
        window.addListener('close-requested', (event) => {
            this.dismiss();
        });
        window.addListener('bounds-changed', (event) => {
            // Only care about vertical resizes
            if (event.height !== this._size.y) {
                this._size.x = event.width;
                this._size.y = event.height;

                // this.onResize.emit(this._size);
                this.onModified.emit();
            }
        });
    }

    public get creationTime(): number {
        return this._creationTime;
    }

    public get age(): number {
        return Date.now() - this._creationTime;
    }

    public get size(): Readonly<Point> {
        return this._size;
    }

    public update(origin: Point, gap: number): boolean {
        if (!this._isOpen) {
            console.warn("Attempting to update a toast that has been closed: " + this._window.identity.name);
            return false;
        }

        if (this._state === ToastState.TRANSITION_IN) {
            const tween: number = this.calculateTween(this._creationTime, Durations.TRANSITION_IN);

            this._window.moveTo(origin.x - (this._size.x * tween), origin.y - this._size.y);
            this._window.updateOptions({opacity: tween});

            if (tween === 1) {
                this._state = ToastState.IDLE;
            }

            origin.y -= (this._size.y + TOAST_SPACING) * tween;

            return true;
        } else if (this._state === ToastState.TRANSITION_OUT) {
            const tween: number = 1 - this.calculateTween(this._dismissTime, Durations.TRANSITION_OUT);

            this._window.moveTo(origin.x - this._size.x, origin.y - this._size.y);
            this._window.updateOptions({opacity: tween});

            if (tween === 0) {
                this.close();
            }

            const sizeTween = 1.0 - this.calculateTween(this._dismissTime, Durations.TRANSITION_OUT, [0.5, 1]);

            origin.y -= (this._size.y + TOAST_SPACING) * sizeTween;

            return true;
        } else {
            this._window.moveTo(origin.x - this._size.x, origin.y - this._size.y);
            origin.y -= this._size.y + TOAST_SPACING;
        }

        return false;
    }

    public async close(): Promise<void> {
        if (this._isOpen) {
            this._isOpen = false;
            await this._window.close(true).catch(() => {});

            // onClose signal will fire once window is closed
        }
    }

    public async dismiss(): Promise<void> {
        if (this._isOpen && !this._dismissTime) {
            this._dismissTime = Date.now();
            this._state = ToastState.TRANSITION_OUT;

            this.onModified.emit();
        }
    }

    public async setPosition(x: number, y: number): Promise<void> {
        if (this._isOpen) {
            return this._window.moveTo(x, y);
        }
    }

    public async setOpacity(value: number): Promise<void> {
        if (this._isOpen && value !== this._opacity) {
            this._opacity = value;
            await this._window.updateOptions({opacity: value});
        }
    }

    private calculateTween(startTime: number, duration: number, range?: [number, number]): number {
        let tween;

        tween = (Date.now() - startTime) / duration;
        if (range) {
            tween = (tween - range[0]) / (range[1] - range[0]);
        }
        tween = Math.min(Math.max(tween, 0), 1);
        tween = 0.5 - (Math.cos(tween * Math.PI) * 0.5);

        return tween;
    }
}

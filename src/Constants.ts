
/**
 * Timing constants
 */
export enum Durations {
    TRANSITION_IN = 500,
    TRANSITION_OUT = 500,
    MAX_AGE = 1000000
}

/**
 * Framerate of toast notifications
 */
export const FPS: number = 30;

/**
 * Offset between toasts and edge of available monitor area
 * 
 * Same for both x and y dimensions
 */
export const SCREEN_PADDING: number = 30;

/**
 * Padding distance between subsequent toasts
 */
export const TOAST_SPACING: number = 20;

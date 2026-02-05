
export const DEBUG_APP: boolean = true;

export const RAD_TO_DEG = 180 / Math.PI;
export const DEG_TO_RAD = Math.PI / 180;
export const MAP_GRID_WIDTH: number = 20;

export function hasCircularReference(obj) {
    try {
        JSON.stringify(obj);
        return false;
    } catch (e) {
        return e.message.includes('circular');
    }
}
import { PipeTransform } from "@angular/core";

// uses pipe to get button text to present to user
export function addOptionFromPipeValue(value: number, map: Map<number, string>, pipe: PipeTransform) {
    map.set(value, pipe.transform(value));
}
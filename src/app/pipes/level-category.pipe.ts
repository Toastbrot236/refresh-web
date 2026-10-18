import { Pipe, PipeTransform } from '@angular/core';
import {GameVersion} from "../api/types/game-version";

@Pipe({
  name: 'game',
  standalone: true
})
export class LevelCategoryPipe implements PipeTransform {
  transform(value: string, short: boolean = false): string {
    switch (value) {
      case "byUser":
        return short ? "Published" : "Published by";
      case "hearted":
        return short ? "Hearted" : "Hearted by";
      default:
        return value; // whatever lol
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import {GameVersion} from "../api/types/game-version";

@Pipe({
  name: 'game',
  standalone: true
})
export class PhotoCategoryPipe implements PipeTransform {
  transform(value: string, short: boolean = false): string {
    switch (value) {
      case "by":
        return short ? "Published" : "Published by";
      case "with":
        return "Starring"
      default:
        return value; // whatever lol
    }
  }
}

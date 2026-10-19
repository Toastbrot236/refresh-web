import { Pipe, PipeTransform } from '@angular/core';
import {GameVersion} from "../api/types/game-version";

@Pipe({
  name: 'photoCategory',
  standalone: true
})
export class PhotoCategoryPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case "by":
        return "Published by";
      case "with":
        return "Starring"
      default:
        return value; // whatever lol
    }
  }
}

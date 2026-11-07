import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'levelCategory',
  standalone: true
})
export class LevelCategoryPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case "byUser":
        return "Published by";
      case "hearted":
        return "Hearted by";
      default:
        return value; // whatever lol
    }
  }
}
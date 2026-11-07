import { Pipe, PipeTransform } from '@angular/core';

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
        return "With"
      default:
        return value; // whatever lol
    }
  }
}
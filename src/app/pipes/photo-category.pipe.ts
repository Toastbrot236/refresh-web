import { Pipe, PipeTransform } from '@angular/core';
import { PhotoCategoryRoute } from '../api/types/photos/photo-category-route';

@Pipe({
  name: 'photoCategory',
  standalone: true
})
export class PhotoCategoryPipe implements PipeTransform {
  transform(value: PhotoCategoryRoute): string {
    switch (value) {
      case PhotoCategoryRoute.ByUser:
        return "Published by";
      case PhotoCategoryRoute.WithUser:
        return "With"
      default:
        return value; // whatever lol
    }
  }
}
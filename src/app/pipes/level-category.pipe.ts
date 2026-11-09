import { Pipe, PipeTransform } from '@angular/core';
import { LevelCategoryRoute } from '../api/types/levels/level-category-route';

@Pipe({
  name: 'levelCategory',
  standalone: true
})
export class LevelCategoryPipe implements PipeTransform {
  transform(value: LevelCategoryRoute): string {
    switch (value) {
      case LevelCategoryRoute.ByUser:
        return "Published by";
      case LevelCategoryRoute.HeartedByUser:
        return "Hearted by";
      default:
        return value; // whatever lol
    }
  }
}
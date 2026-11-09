import { Pipe, PipeTransform } from '@angular/core';
import { ContentVisibility } from '../api/types/content-visibility';

@Pipe({
  name: 'content-visibility',
  standalone: true
})
export class ContentVisibilityPipe implements PipeTransform {

  // viewedByOwnUser: is this string formatted for the user themselves or another user viewed by a moderator
  transform(value: ContentVisibility, viewedByOwnUser: boolean = true): string {
    const pronoun: string = viewedByOwnUser ? "you" : "this user";

    switch (value) {
      case ContentVisibility.Everyone:
        return "Everyone";
      case ContentVisibility.SignedIn:
        return "Signed in users only";
      case ContentVisibility.Staff:
        return "Just " + pronoun + " and staff";
    }
  }
}

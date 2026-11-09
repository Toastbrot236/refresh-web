import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ListWithData } from '../../../api/list-with-data';

@Component({
    selector: 'app-entity-list',
    imports: [],
    template: `
      @if (list.data.length > 0) {
        <ng-content />

        <!-- TODO move this to the infinite scroller component -->
        @if (errorMessage) {
          <h2>Downloading more stuff failed!</h2>
          <p>{{errorMessage}}</p>
        }
      }
      @else if (errorMessage) {
        <h2>Download failed!</h2>
        <p>{{errorMessage}}</p>
      }
      @else if (list.listInfo.totalItems === 0) {
        <p>Downloading stuff...</p>
      }
      @else {
          <p>Nothing found!</p>
      }
      @if (list.data.length >= list.listInfo.totalItems) {
          <p>This is the end of the list...</p>
      }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})
export class EntityListComponent {
  @Input({required: true}) list: ListWithData<any> = null!;
  @Input() errorMessage: string | undefined;
}

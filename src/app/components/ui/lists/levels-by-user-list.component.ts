import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-full-entity-list',
    imports: [],
    template: `
    <div class="bg-backdrop rounded px-5 py-2.5 drop-shadow-md">
      <ng-content></ng-content>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})
export class LevelsByUserListComponent {

}

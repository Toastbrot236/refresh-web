import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";
import {SlugPipe} from "../../../../pipes/slug.pipe";
import { MinimalLevel } from '../../../../api/types/levels/minimal-level';

// A simple link to a level.
@Component({
    selector: 'app-level-router-link',
    imports: [
        RouterLink,
        SlugPipe
    ],
    template: `
    <a routerLink="/level/{{level.levelId}}/{{level.title | slug}}" class="hover:underline">
      <ng-content></ng-content>
    </a>
  `
})
export class LevelRouterLinkComponent {
  @Input({required: true}) public level: MinimalLevel = undefined!;
}

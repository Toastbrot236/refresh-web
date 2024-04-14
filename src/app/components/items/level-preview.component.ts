import {Component, Input} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {UserLinkComponent} from "../ui/links/user-link.component";
import {LevelAvatarComponent} from "../ui/photos/level-avatar.component";
import {LevelStatisticsComponent} from "./level-statistics.component";
import {LevelRouterLinkComponent} from "../ui/links/level-router-link.component";

@Component({
  selector: 'app-level-preview',
  standalone: true,
  imports: [
    UserLinkComponent,
    LevelAvatarComponent,
    LevelStatisticsComponent,
    LevelRouterLinkComponent
  ],
  template: `
    <div class="flex gap-x-2 leading-none">
      <app-level-router-link [level]="level">
        <app-level-avatar [level]="level" [size]=72></app-level-avatar>
      </app-level-router-link>
      <div>
        <app-level-router-link [level]=level>
          <p class="font-medium text-lg">{{ level.title }}</p>
        </app-level-router-link>
        
        <app-level-statistics [level]="level" class="text-sm"></app-level-statistics>
        
        <span class="text-gentle italic">
            by <app-user-link [user]="level.publisher"></app-user-link>
        </span>
      </div>
    </div>
  `,
  styles: ``
})
export class LevelPreviewComponent {
  @Input({required: true}) level!: Level;
}

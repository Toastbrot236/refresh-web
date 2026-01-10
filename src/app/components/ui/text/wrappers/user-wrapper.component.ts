import {Component, Input} from '@angular/core';
import {UserAvatarComponent} from "../../photos/user-avatar.component";
import {UserRouterLinkComponent} from "../links/user-router-link.component";
import { MinimalUser } from '../../../../api/types/users/minimal-user';

@Component({
    selector: 'app-user-wrapper',
    imports: [
        UserAvatarComponent,
        UserRouterLinkComponent
    ],
    template: `
    <div class="flex gap-x-2.5">
      <app-user-router-link [user]=user>
        <app-user-avatar class="ml-1" [user]=user [size]=48></app-user-avatar>
      </app-user-router-link>
      
      <div class="flex flex-col grow">
        <div class="flex flex-row">
          <app-user-router-link [user]="user" class="font-bold text-[17px]">
            <div class="flex flex-row">
              {{user.username}}
            </div>
          </app-user-router-link>
          <ng-content select="[next]"></ng-content>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class UserWrapperComponent {
  @Input({required: true}) public user: MinimalUser = null!;
}

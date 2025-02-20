import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DefaultPipe} from "../../../pipes/default.pipe";
import { AsyncPipe } from "@angular/common";
import {UserAvatarComponent} from "../../../components/ui/photos/user-avatar.component";
import {DateComponent} from "../../../components/ui/info/date.component";
import {FancyHeaderComponent} from "../../../components/ui/layouts/fancy-header.component";
import {LayoutService} from "../../../services/layout.service";
import {UserStatusComponent} from "../../../components/ui/info/user-status.component";
import {UserStatisticsComponent} from "../../../components/items/user-statistics.component";
import { TwoPaneLayoutComponent } from "../../../components/ui/layouts/two-pane-layout.component";
import { ContainerComponent } from "../../../components/ui/container.component";
import { PaneTitleComponent } from "../../../components/ui/text/pane-title.component";
import { DividerComponent } from "../../../components/ui/divider.component";
import { LevelLeaderboardComponent } from "../../../components/items/level-leaderboard.component";
import { EventPageComponent } from "../../../components/items/event-page.component";
import { SlugPipe } from "../../../pipes/slug.pipe";
import { PageTitleComponent } from "../../../components/ui/text/page-title.component";
import { ExtendedUser } from '../../../api/types/users/extended-user';
import { AuthenticationService } from '../../../api/authentication.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    DefaultPipe,
    UserAvatarComponent,
    DateComponent,
    FancyHeaderComponent,
    AsyncPipe,
    UserStatusComponent,
    UserStatisticsComponent,
    TwoPaneLayoutComponent,
    ContainerComponent,
    PaneTitleComponent,
    DividerComponent,
    LevelLeaderboardComponent,
    EventPageComponent,
    SlugPipe,
    PageTitleComponent
  ],
  templateUrl: './user-settings.component.html',
  styles: ``
})

export class UserSettingsComponent {
  user: ExtendedUser | undefined | null;

  constructor(private auth: AuthenticationService, route: ActivatedRoute, protected layout: LayoutService) {
    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.auth.user.subscribe(user => {
        this.user = user;
      });
    })
  }
}

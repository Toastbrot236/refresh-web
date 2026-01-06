import { Component } from '@angular/core';
import {User} from "../../api/types/users/user";
import {TitleService} from "../../services/title.service";
import {ClientService} from "../../api/client.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {DefaultPipe} from "../../pipes/default.pipe";
import { AsyncPipe } from "@angular/common";
import {UserAvatarComponent} from "../../components/ui/photos/user-avatar.component";
import {DateComponent} from "../../components/ui/info/date.component";
import {FancyHeaderComponent} from "../../components/ui/layouts/fancy-header.component";
import {LayoutService} from "../../services/layout.service";
import {UserStatusComponent} from "../../components/ui/info/user-status.component";
import {UserStatisticsComponent} from "../../components/items/user-statistics.component";
import { ContainerComponent } from "../../components/ui/container.component";
import { PaneTitleComponent } from "../../components/ui/text/pane-title.component";
import { TwoPaneLayoutComponent } from "../../components/ui/layouts/two-pane-layout.component";
import { DividerComponent } from "../../components/ui/divider.component";
import { BannerService } from '../../banners/banner.service';
import { CommentListComponent } from "../../components/items/comment-preview-list.component";
import { AuthenticationService } from '../../api/authentication.service';
import { ExtendedUser } from '../../api/types/users/extended-user';

@Component({
    selector: 'app-user',
    imports: [
    DefaultPipe,
    UserAvatarComponent,
    DateComponent,
    FancyHeaderComponent,
    AsyncPipe,
    UserStatusComponent,
    UserStatisticsComponent,
    ContainerComponent,
    PaneTitleComponent,
    TwoPaneLayoutComponent,
    DividerComponent,
    RouterLink,
    CommentListComponent
],
    templateUrl: './user.component.html',
    styles: ``
})
export class UserComponent {
  user: User | undefined | null;
  protected ownUser: ExtendedUser | undefined;

  constructor(private title: TitleService, private client: ClientService, route: ActivatedRoute, 
    protected layout: LayoutService, private auth: AuthenticationService) {

    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe(user => {
        this.user = user;
      });

      this.auth.user.subscribe(user => {
        if(user) {
          this.ownUser = user;
        }
      });
    });
  }

  totalCommentCount: number = -1;

  setTotalCommentCount(newCount: number) {
    this.totalCommentCount = newCount;
  }
}

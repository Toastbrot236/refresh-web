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
import { Comment } from '../../api/types/comments/comment';
import { defaultListInfo, RefreshApiListInfo } from '../../api/refresh-api-list-info';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { CommentComponent } from "../../components/items/comment.component";
import { DarkContainerComponent } from "../../components/ui/dark-container.component";

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
    CommentComponent,
    DarkContainerComponent
],
    templateUrl: './user.component.html',
    styles: ``
})
export class UserComponent {
  user: User | undefined | null;
  comments: Comment[] = [];
  commentListInfo: RefreshApiListInfo = defaultListInfo;
  previewCommentCount: number = 4;

  constructor(private title: TitleService, private client: ClientService, route: ActivatedRoute, 
    protected layout: LayoutService, protected banner: BannerService) {

    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe(user => {
        this.user = user;

        this.client.getProfileComments(this.user.userId, 0, this.previewCommentCount).subscribe({
          error: error => {
            const apiError: RefreshApiError | undefined = error.error?.error;
            this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
          },
          next: response => {
            this.comments = response.data.slice(0, this.previewCommentCount);
            this.commentListInfo = response.listInfo;
          }
        });
      });
    });
  }

  protected deleteComment(comment: Comment, index: number) {
    let oldList: Comment[] = this.comments;
    this.comments = [];
    for (let i = 0; i < oldList.length; i++) {
        if (i != index) this.comments.push(oldList[i]);
    }
  }
}

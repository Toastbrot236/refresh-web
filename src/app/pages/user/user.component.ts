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
import { DividerComponent } from "../../components/ui/divider.component";
import { Level } from '../../api/types/levels/level';
import { TwoPaneLayoutComponent } from "../../components/ui/layouts/two-pane-layout.component";
import { BannerService } from '../../banners/banner.service';
import { LevelPreviewComponent } from "../../components/items/level-preview.component";
import { DarkContainerComponent } from "../../components/ui/dark-container.component";
import { RefreshApiError } from '../../api/refresh-api-error';

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
        RouterLink,
        DividerComponent,
        TwoPaneLayoutComponent,
        LevelPreviewComponent,
        DarkContainerComponent,
    ],
    templateUrl: './user.component.html',
    styles: ``
})
export class UserComponent {
  user: User | undefined | null;

  publishedLevels: Level[] | undefined;
  heartedLevels: Level[] | undefined;

  publishedLevelsPlaceholderText = "No levels";
  heartedLevelsPlaceholderText = "No levels";

  constructor(private title: TitleService, private client: ClientService, private route: ActivatedRoute, protected layout: LayoutService, private banner: BannerService) {
    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe(user => {
        this.user = user;
      });

      this.client.getLevelsInCategory("byUser", 0, 3, {"u": username}).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.publishedLevelsPlaceholderText = "Failed to fetch levels: ";
          if (apiError?.statusCode == 404) this.publishedLevelsPlaceholderText += "Category not found";
          else this.publishedLevelsPlaceholderText += apiError == null ? error.message : apiError!.message;
        },
        next: list => {
          this.publishedLevels = list.data;
        }
      });

      this.client.getLevelsInCategory("hearted", 0, 3, {"u": username}).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.heartedLevelsPlaceholderText = "Failed to fetch levels: ";
          if (apiError?.statusCode == 404) this.heartedLevelsPlaceholderText += "Category not found";
          else this.heartedLevelsPlaceholderText += apiError == null ? error.message : apiError!.message;
        },
        next: list => {
          this.heartedLevels = list.data;
        }
      });
    })
  }
}

import {Component, effect, Inject, PLATFORM_ID, signal} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {ClientService} from "../../api/client.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {SlugPipe} from "../../pipes/slug.pipe";
import { AsyncPipe, isPlatformBrowser } from "@angular/common";
import {LevelStatisticsComponent} from "../../components/items/level-statistics.component";
import {DefaultPipe} from "../../pipes/default.pipe";
import {LevelAvatarComponent} from "../../components/ui/photos/level-avatar.component";
import {UserLinkComponent} from "../../components/ui/text/links/user-link.component";
import {EmbedService} from "../../services/embed.service";
import {FancyHeaderComponent} from "../../components/ui/layouts/fancy-header.component";
import {GamePipe} from "../../pipes/game.pipe";
import {LayoutService} from "../../services/layout.service";
import {DateComponent} from "../../components/ui/info/date.component";
import {TwoPaneLayoutComponent} from "../../components/ui/layouts/two-pane-layout.component";
import {ContainerComponent} from "../../components/ui/container.component";

import {DividerComponent} from "../../components/ui/divider.component";
import {PaneTitleComponent} from "../../components/ui/text/pane-title.component";
import {EventPageComponent} from "../../components/items/event-page.component";
import {ActivityPage} from "../../api/types/activity/activity-page";

import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { FancyHeaderLevelButtonsComponent } from '../../components/ui/layouts/fancy-header-level-buttons.component';
import { LevelRelations } from '../../api/types/levels/level-relations';
import { OriginalPublisherRouterLink } from "../../components/ui/text/links/original-publisher-router-link.component";
import { LargerLabelComponent } from "../../components/ui/info/larger-label.component";
import { TooltipComponent } from "../../components/ui/text/tooltip.component";
import { ScoreTypePipe } from '../../pipes/score-type.pipe';
import { LevelType } from '../../api/types/levels/level-type';
import { Score } from '../../api/types/levels/score';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { LevelLeaderboardComponent } from '../level-leaderboard/level-leaderboard.component';

interface ScoreFilterFormInput {
  scoreType: number,
}

@Component({
    selector: 'app-level',
    imports: [
    LevelStatisticsComponent,
    DefaultPipe,
    LevelAvatarComponent,
    UserLinkComponent,
    FancyHeaderComponent,
    FancyHeaderLevelButtonsComponent,
    GamePipe,
    AsyncPipe,
    DateComponent,
    TwoPaneLayoutComponent,
    ContainerComponent,
    DividerComponent,
    PaneTitleComponent,
    EventPageComponent,
    RouterLink,
    SlugPipe,
    OriginalPublisherRouterLink,
    LargerLabelComponent,
    TooltipComponent,
    LevelLeaderboardComponent
],
    providers: [
        SlugPipe,
        ScoreTypePipe
    ],
    templateUrl: './level.component.html'
})
export class LevelComponent {
  level: Level | undefined | null;
  activityPage: ActivityPage | undefined;
  
  protected readonly isBrowser: boolean;
  protected isMobile: boolean = false;
  protected ownUser: ExtendedUser | undefined;
  protected relations: LevelRelations | undefined;

  constructor(private embed: EmbedService, private client: ClientService, private slug: SlugPipe, protected scoreTypePipe: ScoreTypePipe,
              route: ActivatedRoute, protected layout: LayoutService, private auth: AuthenticationService,
              @Inject(PLATFORM_ID) platformId: Object, protected banner: BannerService)
  {
    this.isBrowser = isPlatformBrowser(platformId);

    route.params.subscribe(params => {
      const id: number = +params['id'];
      this.client.getLevelById(id).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.banner.warn("Failed to get level", apiError == null ? error.message : apiError.message);
        },
        next: data => {
          this.setDataFromLevel(data);
          this.auth.user.subscribe(user => {
            if(user) {
              this.ownUser = user;
            }
          });
        }
      });
    });

    this.layout.isMobile.subscribe(v => this.isMobile = v);
  }

  setDataFromLevel(data: Level) {
    this.level = data;
    this.relations = data.ownRelations;

    if(this.isBrowser) {
      window.history.replaceState({}, '', `/level/${data.levelId}/${this.slug.transform(data.title)}`);
    }

    this.embed.embedLevel(data);

    this.client.getActivityPageForLevel(data.levelId, 0, 20).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to get recent activity for level", apiError == null ? error.message : apiError.message);
      },
      next: page => {
        this.activityPage = page;
      }
    });
  }
}
import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {ClientService} from "../../api/client.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {SlugPipe} from "../../pipes/slug.pipe";
import { AsyncPipe, isPlatformBrowser, } from "@angular/common";
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
import {LevelLeaderboardComponent} from "../../components/items/level-leaderboard.component";
import {DividerComponent} from "../../components/ui/divider.component";
import {PaneTitleComponent} from "../../components/ui/text/pane-title.component";
import {EventPageComponent} from "../../components/items/event-page.component";
import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { FancyHeaderLevelButtonsComponent } from '../../components/ui/layouts/fancy-header-level-buttons.component';
import { CommentCreationComponent } from "../../components/items/comment-creation.component";
import { FormControl, FormGroup } from '@angular/forms';
import { faPaperPlane, faPencil } from '@fortawesome/free-solid-svg-icons';
import { TextAreaComponent } from "../../components/ui/form/textarea.component";
import { ButtonComponent } from "../../components/ui/form/button.component";
import { PageTitleComponent } from "../../components/ui/text/page-title.component";
import { BannerService } from '../../banners/banner.service';
import { Comment } from '../../api/types/comments/comment';
import { CommentComponent } from "../../components/items/comment.component";
import { InfiniteScrollerComponent } from "../../components/ui/infinite-scroller.component";
import { defaultListInfo, RefreshApiListInfo } from '../../api/refresh-api-list-info';
import { RefreshApiError } from '../../api/refresh-api-error';
import { LevelLinkComponent } from "../../components/ui/text/links/level-link.component";
import { CommentPostRequest } from '../../api/types/comments/comment-post-request';

@Component({
    selector: 'app-level-comments',
    imports: [
    DividerComponent,
    TextAreaComponent,
    ButtonComponent,
    PageTitleComponent,
    CommentComponent,
    InfiniteScrollerComponent,
    LevelLinkComponent
],
    providers: [
        SlugPipe
    ],
    templateUrl: './level-comments.component.html'
})
export class LevelCommentsComponent {
  protected level: Level | undefined | null;
  protected ownUser: ExtendedUser | undefined;
  protected readonly isBrowser: boolean;

  protected form = new FormGroup({
    comment: new FormControl(),
  });

  enableCommentSubmitButton: boolean = false;
  initialized: boolean = false;

  comments: Comment[] = [];
  isLoading: boolean = false;
  listInfo: RefreshApiListInfo = defaultListInfo;

  levelLoadFailMessage: string = "Loading level...";

  constructor(private embed: EmbedService, private client: ClientService, private slug: SlugPipe,
              route: ActivatedRoute, protected layout: LayoutService, private auth: AuthenticationService,
              @Inject(PLATFORM_ID) platformId: Object, protected banner: BannerService)
  {
    this.isBrowser = isPlatformBrowser(platformId);

    route.params.subscribe(params => {
      const id: number = +params['id'];

      this.client.getLevelById(id).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.levelLoadFailMessage = "Failed to load level: " + (apiError == null ? error.message : apiError!.message);
        },

        next: response => {
          if(!this.level && response) {
          this.level = response;

          if(this.isBrowser) {
            window.history.replaceState({}, '', `/level/${response.levelId}/${this.slug.transform(response.title)}/comments`);
          }

          this.auth.user.subscribe(user => {
            if(user) {
              this.ownUser = user;
            }

            this.initialized = true;
          });
        }
        }
      });
    });
  }

  loadData(): void {
    if (!this.level) return;

    this.isLoading = true;
    this.client.getLevelComments(this.level.levelId).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.error("Failed to load comments", apiError == null ? error.message : apiError.message);
      },

      next: response => {
        this.isLoading = false;

        this.comments = this.comments.concat(response.data);
        this.listInfo = response.listInfo;
      }
    });
  }

  reset(): void {
    this.comments = [];
    this.isLoading = false;
    this.listInfo = defaultListInfo;
  }

  checkCommentForm() {
    this.enableCommentSubmitButton = this.form.controls.comment.getRawValue() != "";
  }

  postComment() {
    if (!this.enableCommentSubmitButton || !this.level) return;

    // Don't allow users to spam their comment while waiting for response
    this.enableCommentSubmitButton = false;

    let request: CommentPostRequest = {
      content: this.form.controls.comment.getRawValue(),
    };

    this.client.postLevelComment(this.level.levelId, request).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.error("Failed to post comment", apiError == null ? error.message : apiError.message);
        this.enableCommentSubmitButton = true;
      },

      next: response => {
        // Could prepend the response comment here, but it's better to just reload the comment list 
        // like the game does, to also catch new comments by others
        this.reset();
        this.loadData();

        // Reset form
        this.form.controls.comment.setValue("");
        this.enableCommentSubmitButton = false;
      }
    });
  }

  protected readonly faPencil = faPencil;
  protected readonly faPaperPlane = faPaperPlane;
}
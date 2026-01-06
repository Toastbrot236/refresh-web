import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {ClientService} from "../../api/client.service";
import {ActivatedRoute} from "@angular/router";
import {SlugPipe} from "../../pipes/slug.pipe";
import { isPlatformBrowser, } from "@angular/common";
import {EmbedService} from "../../services/embed.service";
import {LayoutService} from "../../services/layout.service";
import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { FormControl, FormGroup } from '@angular/forms';
import { faPaperPlane, faPencil } from '@fortawesome/free-solid-svg-icons';
import { PageTitleComponent } from "../../components/ui/text/page-title.component";
import { BannerService } from '../../banners/banner.service';
import { Comment } from '../../api/types/comments/comment';
import { defaultListInfo, RefreshApiListInfo } from '../../api/refresh-api-list-info';
import { RefreshApiError } from '../../api/refresh-api-error';
import { LevelLinkComponent } from "../../components/ui/text/links/level-link.component";
import { CommentPostRequest } from '../../api/types/comments/comment-post-request';
import { CommentListComponent } from "../../components/items/comment-list.component";

@Component({
    selector: 'app-level-comments',
    imports: [
    PageTitleComponent,
    LevelLinkComponent,
    CommentListComponent
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

  levelLoadFailMessage: string | undefined;
  pageLoadFinished: boolean = false;

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
    this.client.getLevelComments(this.level.levelId, 0, 10).subscribe({
      error: error => {
        this.pageLoadFinished = true;
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.error("Failed to load comments", apiError == null ? error.message : apiError.message);
      },

      next: response => {
        this.pageLoadFinished = true;
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
        this.reset();
        this.loadData();

        // Reset form
        this.form.controls.comment.setValue("");
        this.enableCommentSubmitButton = false;
      }
    });
  }

  removeComment(index: number) {
    // Only decrement stats. Don't remove comment using this component, and have it be hidden using
    // its own HTML until reload instead, otherwise various undefined-related errors happen.
    this.listInfo.totalItems--;
    this.listInfo.nextPageIndex--;

  }

  protected readonly faPencil = faPencil;
  protected readonly faPaperPlane = faPaperPlane;
}
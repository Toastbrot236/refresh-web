import {Component, Input, Output, EventEmitter} from '@angular/core';
import {DateComponent} from "../ui/info/date.component";
import {UserWrapperComponent} from "../ui/text/wrappers/user-wrapper.component";
import {faSignOutAlt, faThumbsDown, faThumbsUp, faTrash} from "@fortawesome/free-solid-svg-icons";
import {ButtonComponent} from "../ui/form/button.component";
import { Comment } from '../../api/types/comments/comment';
import { OutlinedButtonComponent } from "../ui/form/outlined-button.component";
import { ClientService } from '../../api/client.service';
import { BannerService } from '../../banners/banner.service';
import { Observable } from 'rxjs';
import { RefreshApiError } from '../../api/refresh-api-error';
import { AuthenticationService } from '../../api/authentication.service';
import { RatingType } from '../../api/types/comments/rating-type';
import { ExtendedUser } from '../../api/types/users/extended-user';
import { DialogComponent } from "../ui/dialog.component";
import { PageTitleComponent } from "../ui/text/page-title.component";
import { NgClass } from "@angular/common";

@Component({
    selector: 'app-comment',
    imports: [
    DateComponent,
    UserWrapperComponent,
    ButtonComponent,
    OutlinedButtonComponent,
    DialogComponent,
    PageTitleComponent,
    NgClass
],
    template: `
      <app-user-wrapper [user]="comment.publisher">
        @if (showDelete) {
          <ng-container next>
            <div class="flex flex-row grow justify-end ml-4">
              <app-button text="" [icon]="this.faTrash" color="bg-red text-[15px]" yPadding="" (click)="deleteButtonClick()" [enabled]="enableDelete"></app-button>
            </div>
          </ng-container>
        }

        <div class="gap-y-2 flex flex-col grow break-words">
          <p class=" ">{{comment.content}}</p>

          <div class="flex flex-row align-center gap-x-4">
            <app-date class="italic text-gentle text-sm content-center" [date]="comment.timestamp"></app-date>

            <div class="flex flex-row grow justify-end flex-wrap"
              [ngClass]="ratingButtonsEnabled ? 'gap-x-2' : ''">
              <app-outlined-button class="text-[14px]" [text]="comment.rating.yayRatings.toString()" [icon]="faThumbsUp"
                [enabled]="ratingButtonsEnabled" [emphasize]="comment.rating.ownRating > 0" (click)="like()"></app-outlined-button>

              <app-outlined-button class="text-[14px]" [text]="comment.rating.booRatings.toString()" [icon]="faThumbsDown"
                [enabled]="ratingButtonsEnabled" [emphasize]="comment.rating.ownRating < 0" (click)="dislike()"></app-outlined-button>
            </div>
          </div>
        </div>
      </app-user-wrapper>
      
      <!-- Deletion prompt overlay -->
      @defer (when showDeletionPrompt) { @if (showDeletionPrompt) {
        <app-dialog class="flex flex-row flex-grow" (onDialogClose)="closeDeleteDialog()">
          <div class="w-full h-full m-5 flex flex-col">
            <app-page-title title="Are you sure you want to delete this comment? This can not be undone!"></app-page-title>
            <div class="flex flex-row gap-x-6 justify-between mt-10">
              <app-button
                text="Yes, Delete!"
                [icon]="faTrash"
                color="bg-red"
                (click)="delete()"
                [enabled]="enableDelete"
              ></app-button>
              <app-button
                text="No, Go back!"
                [icon]="faSignOutAlt"
                color="bg-secondary"
                (click)="closeDeleteDialog()"
              ></app-button>
            </div>
          </div>
        </app-dialog>
      }}
      
    `
})
export class CommentComponent {
  @Input({required: true}) comment: Comment = null!;
  ownUser: ExtendedUser | undefined | null;

  ratingButtonsEnabled: boolean = false;
  showDelete: boolean = false;
  enableDelete: boolean = true;
  showDeletionPrompt: boolean = false;
  waitingForResponse: boolean = false; // So users couldn't spam requests by spam-clicking the same button

  @Output() onDelete = new EventEmitter; 

  constructor(private client: ClientService, private banner: BannerService, private auth: AuthenticationService) {
    
  }

  ngOnInit() {
    this.auth.user.subscribe(user => {
      if (user) {
        this.ownUser = user;

        // Enable like and dislike buttons if the user is signed in and this isn't the user's own comment
        if (user.userId != this.comment.publisher.userId) {
          this.ratingButtonsEnabled = true;
        }

        // Also show delete button if the user is either:
        // - the comment publisher
        // - the profile owner
        // - the level publisher
        // - an admin or mod
        if (user.userId == this.comment.publisher.userId || user.role >= 96 // TODO: replace with enum value
          || (this.comment.profile && user.userId == this.comment.profile?.userId)
        ) {
          this.showDelete = true;
        }
      }
    });
  }

  deleteButtonClick() {
    this.showDeletionPrompt = !this.showDeletionPrompt;
  }

  closeDeleteDialog() {
    this.showDeletionPrompt = false;
  }

  protected delete() {
    this.enableDelete = false;
    this.closeDeleteDialog();

    if (this.comment.level != null) {
      this.client.deleteLevelComment(this.comment.commentId).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.banner.error("Comment Deletion Failed", apiError == null ? error.message : apiError.message);
          this.enableDelete = true;
        },
        next: response => {
          // Now get the owning list to remove this comment
          this.onDelete.emit();
          this.enableDelete = true;
        }
      });
    }
    else if (this.comment.profile != null) {
      this.client.deleteProfileComment(this.comment.commentId).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.banner.error("Comment Deletion Failed", apiError == null ? error.message : apiError.message);
          this.enableDelete = true;
        },
        next: response => {
          this.onDelete.emit();
          this.enableDelete = true;
        }
      });
    }
    else {
      this.banner.error("Comment Deletion Failed", "Could not determine comment type.");
      return;
    }
  }

  like(): void {
    if (!this.ownUser) return;

    if (this.comment.rating.ownRating > 0) {
      this.rate(RatingType.Neutral);
    }
    else {
      this.rate(RatingType.Like);
    }
  }

  dislike(): void {
    if (!this.ownUser) return;

    if (this.comment.rating.ownRating < 0) {
      this.rate(RatingType.Neutral);
    }
    else {
      this.rate(RatingType.Dislike);
    }
  }

  private rate(rating: RatingType): void {
    if (this.comment.level) {
      this.submitRating(this.client.rateLevelComment(this.comment.commentId, rating), rating);
    }
    else if (this.comment.profile) {
      this.submitRating(this.client.rateProfileComment(this.comment.commentId, rating), rating);
    }
    else {
      this.banner.warn("Can't rate " + this.comment.publisher.username + "'s comment", "The comment's type is unknown.");
    }
  }

  private submitRating(method: Observable<Response>, rating: RatingType) {
    if (this.waitingForResponse) return;
    this.waitingForResponse = true;
    
    method.subscribe({
      error: error => {
        this.waitingForResponse = false;

        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Rating " + this.comment.publisher.username + "'s comment failed", apiError == null ? error.message : apiError.message);
      },
      next: response => {
        this.waitingForResponse = false;

        switch(rating) {
          case RatingType.Like:
            this.comment.rating.yayRatings++;
            break;
          case RatingType.Dislike:
            this.comment.rating.booRatings++;
            break;
        }

        switch(this.comment.rating.ownRating) {
          case RatingType.Like:
            this.comment.rating.yayRatings--;
            break;
          case RatingType.Dislike:
            this.comment.rating.booRatings--;
            break;
        }

        this.comment.rating.ownRating = rating;
      }
    });
  }

  protected readonly faThumbsUp = faThumbsUp;
  protected readonly faThumbsDown = faThumbsDown;
  protected readonly faTrash = faTrash;
  protected readonly faSignOutAlt = faSignOutAlt;
}
import {Component, Input} from '@angular/core';
import {DateComponent} from "../ui/info/date.component";
import {UserWrapperComponent} from "../ui/text/wrappers/user-wrapper.component";
import {faThumbsDown, faThumbsUp, faTrash} from "@fortawesome/free-solid-svg-icons";
import {ButtonComponent} from "../ui/form/button.component";
import { DarkContainerComponent } from "../ui/dark-container.component";
import { Comment } from '../../api/types/comments/comment';
import { OutlinedButtonComponent } from "../ui/form/outlined-button.component";
import { ClientService } from '../../api/client.service';
import { BannerService } from '../../banners/banner.service';
import { Observable } from 'rxjs';
import { RefreshApiError } from '../../api/refresh-api-error';
import { AuthenticationService } from '../../api/authentication.service';
import { RatingType } from '../../api/types/comments/rating-type';
import { ExtendedUser } from '../../api/types/users/extended-user';

@Component({
    selector: 'app-comment',
    imports: [
    DateComponent,
    UserWrapperComponent,
    ButtonComponent,
    DarkContainerComponent,
    OutlinedButtonComponent
],
    template: `
      <app-dark-container>
        <div class="flex flex-row gap-x-2">
          <app-user-wrapper [user]="comment.publisher" class="grow">
            @if (showDelete) {
              <ng-container next>
                <div class="flex flex-row grow justify-end">
                  <app-button text="" [icon]="this.faTrash" color="bg-red text-[15px]" yPadding=""></app-button>
                </div>
              </ng-container>
            }

            <div class="gap-y-2 flex flex-col">
              {{comment.content}}

              <div class="flex flex-row gap-x-2">
                <app-date class="italic text-gentle text-sm" [date]="comment.timestamp"></app-date>

                <div class="flex flex-row grow justify-end gap-x-2 flex-wrap">
                  <app-outlined-button class="text-[14px]" [text]="comment.rating.yayRatings.toString()" [icon]="faThumbsUp"
                    [enabled]="likeEnabled" [emphasize]="comment.rating.ownRating > 0" (click)="like()"></app-outlined-button>

                  <app-outlined-button class="text-[14px]" [text]="comment.rating.booRatings.toString()" [icon]="faThumbsDown"
                    [enabled]="dislikeEnabled" [emphasize]="comment.rating.ownRating < 0" (click)="dislike()"></app-outlined-button>
                </div>
              </div>
            </div>
          </app-user-wrapper>
        </div>
      </app-dark-container>
    `
})
export class CommentComponent {
  @Input({required: true}) comment: Comment = null!;
  ownUser: ExtendedUser | undefined | null;

  likeEnabled: boolean = false;
  dislikeEnabled: boolean = false;
  showDelete: boolean = false;

  constructor(private client: ClientService, private banner: BannerService, private auth: AuthenticationService) {
    
  }

  ngOnInit() {
    this.auth.user.subscribe(user => {
      if (user) {
        this.ownUser = user;

        // Enable like and dislike buttons if the user is signed in
        this.likeEnabled = true;
        this.dislikeEnabled = true;

        // Also show delete button if the user is either:
        // - the comment publisher
        // - the profile owner
        // - the level publisher (TODO once MinimalLevel includes the level's publisher)
        // - an admin (TODO: or mod)
        if (user.userId == this.comment.publisher.userId || user.role > 120
          || (this.comment.profile && user.userId == this.comment.profile?.userId)
        ) {
          this.showDelete = true;
        }
      }
    });
  }

  delete(): void {
    if (!this.ownUser) return;
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

  rate(rating: RatingType): void {
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

  submitRating(method: Observable<Response>, rating: RatingType) {
    method.subscribe({
      error: error => {
        this.likeEnabled = true;
        this.dislikeEnabled = true;

        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Rating " + this.comment.publisher.username + "'s comment failed", apiError == null ? error.message : apiError.message);
      },
      next: response => {
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

  //const emailAddress: string = this.form.controls.emailAddress.getRawValue();

  protected readonly faThumbsUp = faThumbsUp;
  protected readonly faThumbsDown = faThumbsDown;
  protected readonly faTrash = faTrash;

  /*
  <div [class]="'flex flex-row gap-x-1 hover:outline rounded-md cursor-pointer px-1' + (comment.rating.ownRating > 0 ? ' text-yellow' : '')"
                    (click)="this.like.emit()">
                    <fa-icon class="" [icon]="this.faThumbsUp"></fa-icon>
                    <div>
                      {{comment.rating.yayRatings}}
                    </div>
                  </div>
                  <div [class]="'flex flex-row gap-x-1 hover:outline rounded-md cursor-pointer px-1' + (comment.rating.ownRating < 0 ? ' text-yellow' : '')"
                    (click)="this.dislike.emit()">
                    <fa-icon class="" [icon]="this.faThumbsDown"></fa-icon>
                    <div>
                      {{comment.rating.booRatings}}
                    </div>
                  </div>
  */
}
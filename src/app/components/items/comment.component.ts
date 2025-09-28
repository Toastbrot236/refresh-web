import {Component, Input, Output, EventEmitter} from '@angular/core';
import { NgClass, NgOptimizedImage } from "@angular/common";
import {UserLinkComponent} from "../ui/text/links/user-link.component";
import {DateComponent} from "../ui/info/date.component";
import {UserWrapperComponent} from "../ui/text/wrappers/user-wrapper.component";
import {LevelLinkComponent} from "../ui/text/links/level-link.component";
import {faThumbsDown, faThumbsUp, faTrash} from "@fortawesome/free-solid-svg-icons";
import {StatisticComponent} from "../ui/info/statistic.component";
import {ButtonComponent} from "../ui/form/button.component";
import {ButtonGroupComponent} from "../ui/form/button-group.component";
import {RouterLink} from "@angular/router";
import { DarkContainerComponent } from "../ui/dark-container.component";
import { Comment } from '../../api/types/comments/comment';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-comment',
    imports: [
    NgOptimizedImage,
    UserLinkComponent,
    DateComponent,
    UserWrapperComponent,
    LevelLinkComponent,
    StatisticComponent,
    ButtonComponent,
    ButtonGroupComponent,
    RouterLink,
    NgClass,
    DarkContainerComponent,
    FaIconComponent,
],
    template: `
      <app-dark-container>
        <div class="flex flex-row gap-x-2">
          <app-user-wrapper [user]="comment.publisher" class="grow">
            <ng-container next>
              <div class="flex flex-row grow justify-end">
                <app-button text="" [icon]="this.faTrash" color="bg-red text-[12px]"></app-button>
              </div>
            </ng-container>

            <div class="gap-y-2 flex flex-col">
              {{comment.content}}

              <div class="flex flex-row gap-x-2">
                <app-date class="italic text-gentle text-sm" [date]="comment.timestamp"></app-date>

                <div class="flex flex-row grow justify-end gap-x-2 flex-wrap">
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
                </div>
              </div>
            </div>
          </app-user-wrapper>
        </div>
      </app-dark-container>
    `
})
export class CommentComponent {
  @Input({required:true}) comment: Comment = null!;

  @Output() like = new EventEmitter;
  likeEnabled: boolean = true;

  @Output() dislike = new EventEmitter;
  dislikeEnabled: boolean = true;

  @Output() delete = new EventEmitter;

  protected readonly faThumbsUp = faThumbsUp;
  protected readonly faThumbsDown = faThumbsDown;
  protected readonly faTrash = faTrash;
}
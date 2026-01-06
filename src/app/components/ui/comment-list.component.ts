import { Component, Input } from '@angular/core';
import { TextAreaComponent } from "./form/textarea.component";
import { FormControl, FormGroup } from '@angular/forms';
import { faPaperPlane, faPencil } from '@fortawesome/free-solid-svg-icons';
import { ExtendedUser } from '../../api/types/users/extended-user';
import { DividerComponent } from "./divider.component";
import { defaultListInfo, RefreshApiListInfo } from '../../api/refresh-api-list-info';
import { Comment } from '../../api/types/comments/comment';
import { CommentComponent } from "../items/comment.component";
import { ClientService, defaultPageSize } from '../../api/client.service';
import { BannerService } from '../../banners/banner.service';
import { Level } from '../../api/types/levels/level';
import { User } from '../../api/types/users/user';
import { InfiniteScrollerComponent } from "./infinite-scroller.component";
import { RefreshApiError } from '../../api/refresh-api-error';
import { ContainerComponent } from "./container.component";
import { PageTitleComponent } from "./text/page-title.component";
import { LevelLinkComponent } from "./text/links/level-link.component";
import { UserLinkComponent } from "./text/links/user-link.component";
import { ButtonComponent } from "./form/button.component";

@Component({
    selector: 'app-comment-list',
    imports: [
    TextAreaComponent,
    DividerComponent,
    CommentComponent,
    InfiniteScrollerComponent,
    ContainerComponent,
    PageTitleComponent,
    LevelLinkComponent,
    UserLinkComponent,
    ButtonComponent
],
    template: `
        <div class="flex flex-row flex-wrap gap-x-4">
                <app-page-title title="Comments on "></app-page-title>
                @if (level != null) {
                    <app-level-link class="content-center text-xl" [level]="level" [iconSize]="25"></app-level-link>
                }
                @else if (profile != null) {
                    <app-user-link class="content-center text-xl" [user]="profile" [iconSize]="30"></app-user-link>
                }
                @else {
                    <p>Unknown</p>
                }
            <span class="text-sm italic text-gentle text-base content-center">({{this.listInfo.totalItems}} in total)</span>
        </div>
        @if (initialized === true) {
            <div class="flex flex-col pt-5 gap-y-2">
                @if (ownUser) {
                    <div class="flex flex-col gap-y-2">
                        <app-textarea [icon]="faPencil" [form]="form" placeholder="Write a comment..." ctrlName="comment" (change)="checkCommentForm()"></app-textarea>
                        <div class="flex flex-row justify-end">
                            <app-button [icon]="faPaperPlane" text="Send" color="bg-primary" [enabled]="enableCommentSubmitButton" (click)="postComment()"></app-button>
                        </div>
                    </div>

                    <app-divider></app-divider>
                }
                
                @if (comments.length > 0) {
                    <div class="flex flex-col gap-y-2">
                        @for (comment of this.comments; track comment.commentId; let i = $index) {
                            <app-container>
                                <app-comment [comment]="comment" (onDelete)="deleteComment(comment, i)" [id]="'c' + i"></app-comment>
                            </app-container>
                        }
                    </div>
                    <app-infinite-scroller [isLoading]="this.isLoading" [listInfo]="this.listInfo" (loadData)="loadData()"></app-infinite-scroller>
                }
            </div>
        }
    `,
    styles: ``
})
export class CommentListComponent {
    @Input() ownUser: ExtendedUser | undefined = undefined;

    comments: Comment[] = [];
    listInfo: RefreshApiListInfo = defaultListInfo;

    @Input() level: Level | undefined;
    @Input() profile: User | undefined;

    protected form = new FormGroup({
        comment: new FormControl(),
    });

    enableCommentSubmitButton: boolean = false;
    initialized: boolean = false;
    isLoading: boolean = false;

    constructor(protected client: ClientService, protected banner: BannerService) {
        
    }

    ngOnInit() {
        if (!this.initialized) {
            this.initialized = true;
            this.reload();
        }
    }

    checkCommentForm() {
        this.enableCommentSubmitButton = this.form.controls.comment.getRawValue() != "";
    }

    loadData() {
        if (this.comments.length == this.listInfo.totalItems) return; // No more items to fetch;

        let newPage: Comment[] = [];
        
        if (this.level !== undefined) {
            this.isLoading = true;
            this.client.getLevelComments(this.level.levelId, this.listInfo.nextPageIndex, defaultPageSize).subscribe({
                error: error => {
                    this.isLoading = false;
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                },
                next: response => {
                    this.isLoading = false;
                    this.comments = this.comments.concat(response.data);
                    this.listInfo = response.listInfo;
                }
            });
        }
        else if (this.profile !== undefined) {
            this.isLoading = true;
            this.client.getProfileComments(this.profile.userId, this.listInfo.nextPageIndex, defaultPageSize).subscribe({
                error: error => {
                    this.isLoading = false;
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                },
                next: response => {
                    this.isLoading = false;
                    this.comments = this.comments.concat(response.data);
                    this.listInfo = response.listInfo;
                }
            });
        }
        else {
            this.banner.error("Comment Fetching Failed", "Could not get comments because the commented object is unknown.");
            return;
        }
    }

    postComment() {
        if (!this.enableCommentSubmitButton) return;
        this.enableCommentSubmitButton = false; // No spamming
        let content: string = this.form.controls.comment.getRawValue();

        if (this.level != null) {
            this.client.postLevelComment(this.level.levelId, { content: content }).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                    this.enableCommentSubmitButton = true;
                },
                next: response => {
                    // instead of inserting the new comment to the beginning, reload the comments entirely to catch
                    // newly posted ones
                    this.reload();
                }
            });
        }
        else if (this.profile != null) {
            this.client.postProfileComment(this.profile.userId, { content: content }).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                    this.enableCommentSubmitButton = true;
                },
                next: response => {
                    this.reload();
                }
            });
        }
        else {
            this.banner.error("Comment Upload Failed", "Could not post comment because the object to comment is unknown.");
            return;
        }

        this.client.postLevelComment

        
    }

    deleteComment(comment: Comment, index: number) {
        if (comment.level != null) {
            this.client.deleteLevelComment(comment.commentId).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Deletion Failed", apiError == null ? error.message : apiError.message);
                },
                next: response => {
                    this.removeComment(comment, index);
                }
            });
        }
        else if (comment.profile != null) {
            this.client.deleteProfileComment(comment.commentId).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Deletion Failed", apiError == null ? error.message : apiError.message);
                },
                next: response => {
                    this.removeComment(comment, index);
                }
            });
        }
        else {
            this.banner.error("Comment Deletion Failed", "Could not determine comment type.");
            return;
        }
    }

    private removeComment(comment: Comment, index: number) {
        let oldList: Comment[] = this.comments;
        this.comments = [];
        for (let i = 0; i < oldList.length; i++) {
            if (i != index) this.comments.push(oldList[i]);
        }
    }

    reset(): void {
        this.form.controls.comment.setValue("");
        this.comments = [];
        this.isLoading = false;
        this.listInfo = defaultListInfo;
    }

    reload(): void {
        this.reset();
        this.loadData();
    }

    protected readonly faPencil = faPencil;
    protected readonly faPaperPlane = faPaperPlane;
}

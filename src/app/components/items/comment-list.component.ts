import { Component, Input } from '@angular/core';
import { TextAreaComponent } from "../ui/form/textarea.component";
import { FormControl, FormGroup } from '@angular/forms';
import { faPaperPlane, faPencil } from '@fortawesome/free-solid-svg-icons';
import { ExtendedUser } from '../../api/types/users/extended-user';
import { defaultListInfo, RefreshApiListInfo } from '../../api/refresh-api-list-info';
import { Comment } from '../../api/types/comments/comment';
import { CommentComponent } from "./comment.component";
import { ClientService, defaultPageSize } from '../../api/client.service';
import { BannerService } from '../../banners/banner.service';
import { Level } from '../../api/types/levels/level';
import { User } from '../../api/types/users/user';
import { InfiniteScrollerComponent } from "../ui/infinite-scroller.component";
import { RefreshApiError } from '../../api/refresh-api-error';
import { ContainerComponent } from "../ui/container.component";
import { PageTitleComponent } from "../ui/text/page-title.component";
import { LevelLinkComponent } from "../ui/text/links/level-link.component";
import { UserLinkComponent } from "../ui/text/links/user-link.component";
import { ButtonComponent } from "../ui/form/button.component";
import { Observable } from 'rxjs';
import { ListWithData } from '../../api/list-with-data';
import { ContainerHeaderComponent } from "../ui/container-header.component";

@Component({
    selector: 'app-comment-list',
    imports: [
    TextAreaComponent,
    CommentComponent,
    InfiniteScrollerComponent,
    ContainerComponent,
    PageTitleComponent,
    LevelLinkComponent,
    UserLinkComponent,
    ButtonComponent,
    ContainerHeaderComponent
],
    template: `
        <div class="flex flex-col">
            <app-container-header>
                <div class="flex flex-row flex-wrap gap-x-4 mb-4">
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
                
                <app-textarea [icon]="faPencil" [form]="form" placeholder="Write a comment..." ctrlName="comment" (change)="checkCommentForm()"></app-textarea>
                <div class="flex flex-row justify-end mt-4">
                    <app-button [icon]="faPaperPlane" text="Send" color="bg-primary" [enabled]="enableCommentSubmitButton" (click)="postComment()"></app-button>
                </div>
            </app-container-header>
            
            @if (comments.length > 0) {
                <div class="flex flex-col gap-y-2">
                    @for (comment of this.comments; track comment.commentId; let i = $index) {
                        <app-container>
                            <app-comment [comment]="comment" (onDelete)="removeComment(i)"></app-comment>
                        </app-container>
                    }
                </div>
                <app-infinite-scroller [isLoading]="this.isLoading" [listInfo]="this.listInfo" (loadData)="loadData()"></app-infinite-scroller>
            }
            @else {
                <p>No comments yet... Why not post one?</p>
            }
        </div>
    `,
    styles: ``
})
export class CommentListComponent {
    @Input() ownUser: ExtendedUser | undefined = undefined;
    @Input() level: Level | undefined;
    @Input() profile: User | undefined;

    comments: Comment[] = [];
    listInfo: RefreshApiListInfo = defaultListInfo;
    initialized: boolean = false;
    isLoading: boolean = false;
    enableCommentSubmitButton: boolean = false;

    protected form = new FormGroup({
        comment: new FormControl(),
    });

    constructor(protected client: ClientService, protected banner: BannerService) {}

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
        if (this.level !== undefined) {
            this.handleCommentListResponse(this.client.getLevelComments(this.level.levelId, this.listInfo.nextPageIndex, defaultPageSize));
        }
        else if (this.profile !== undefined) {
            this.handleCommentListResponse(this.client.getProfileComments(this.profile.userId, this.listInfo.nextPageIndex, defaultPageSize));
        }
    }

    private handleCommentListResponse(request: Observable<ListWithData<Comment>>) {
        request.subscribe({
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

    postComment() {
        let content: string = this.form.controls.comment.getRawValue();

        if (this.level !== undefined) {
            this.handlePostCommentResponse(this.client.postLevelComment(this.level.levelId, { content: content }));
        }
        else if (this.profile !== undefined) {
            this.handlePostCommentResponse(this.client.postProfileComment(this.profile.userId, { content: content }));
        }
        else {
            this.banner.error("Comment Upload Failed", "Could not post comment because the object to comment is unknown.");
        }
    }

    private handlePostCommentResponse(request: Observable<Comment>) {
        request.subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                this.enableCommentSubmitButton = true;
            },
            next: _ => {
                // instead of inserting the new comment to the beginning, reload the comments entirely to catch
                // newly posted ones
                this.reload();
            }
        });
    }

    removeComment(index: number) {
        this.listInfo.nextPageIndex--;
        this.listInfo.totalItems--;

        let oldList: Comment[] = this.comments;
        this.comments = [];
        for (let i = 0; i < oldList.length; i++) {
            if (i != index) this.comments.push(oldList[i]);
        }
    }

    reload(): void {
        this.isLoading = true;
        this.form.controls.comment.setValue("");
        this.comments = [];
        this.listInfo = defaultListInfo;
        this.loadData();
    }

    protected readonly faPencil = faPencil;
    protected readonly faPaperPlane = faPaperPlane;
}

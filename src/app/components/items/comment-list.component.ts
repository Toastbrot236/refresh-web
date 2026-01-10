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
import { User } from '../../api/types/users/user';
import { InfiniteScrollerComponent } from "../ui/infinite-scroller.component";
import { RefreshApiError } from '../../api/refresh-api-error';
import { ContainerComponent } from "../ui/container.component";
import { PageTitleComponent } from "../ui/text/page-title.component";
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
    UserLinkComponent,
    ButtonComponent,
    ContainerHeaderComponent
],
    template: `
        <div class="flex flex-col">
            <app-container-header>
                <div class="flex flex-row flex-wrap gap-x-4 mb-4">
                    <app-page-title title="Comments on "></app-page-title>
                    @if (profile != null) {
                        <app-user-link class="content-center text-xl" [user]="profile" [iconSize]="30"></app-user-link>
                    }
                    @else {
                        <p>Unknown</p>
                    }
                    <span class="text-sm italic text-gentle text-base content-center">({{this.listInfo.totalItems}} in total)</span>
                </div>
                
                <app-textarea [icon]="faPencil" [form]="form" placeholder="Write a comment..." ctrlName="comment" (change)="checkCommentForm()"></app-textarea>
                <div class="flex flex-row justify-end mt-4">
                    <app-button [icon]="faPaperPlane" text="Send" color="bg-primary" [enabled]="commentFormHasContent && !isSubmittingComment" (click)="postComment()"></app-button>
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
    @Input() profile: User | undefined;

    comments: Comment[] = [];
    listInfo: RefreshApiListInfo = defaultListInfo;
    isLoading: boolean = false;
    commentFormHasContent: boolean = false;
    isSubmittingComment: boolean = false;

    protected form = new FormGroup({
        comment: new FormControl(),
    });

    constructor(protected client: ClientService, protected banner: BannerService) {}

    ngOnInit() {
        this.reload();
    }

    checkCommentForm() {
        this.commentFormHasContent = this.form.controls.comment.getRawValue() != "";
    }

    loadData() {
        if (this.profile !== undefined) {
            this.handleCommentListResponse(this.client.getProfileComments(this.profile.userId, defaultPageSize, this.listInfo.nextPageIndex));
        }
    }

    private handleCommentListResponse(request: Observable<ListWithData<Comment>>) {
        request.subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                this.isLoading = false;
            },
            next: response => {
                this.comments = this.comments.concat(response.data);
                this.listInfo = response.listInfo;
                this.isLoading = false;
            }
        });
    }

    postComment() {
        let content: string = this.form.controls.comment.getRawValue();

        if (this.profile !== undefined) {
            this.isSubmittingComment = true;
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
                this.isSubmittingComment = false;
            },
            next: _ => {
                this.form.controls.comment.setValue("");
                this.commentFormHasContent = false;
                this.isSubmittingComment = false;

                // instead of inserting the new comment to the beginning of the array, 
                // reload the comments entirely to catch other newly posted ones
                this.reload();
            }
        });
    }

    removeComment(index: number) {
        this.listInfo.nextPageIndex--;
        this.listInfo.totalItems--;

        // No extra method for removing an element at a specific index from an array,
        // so instead create a new array which has all comments but the one we want to remove
        let oldList: Comment[] = this.comments;
        this.comments = [];
        for (let i = 0; i < oldList.length; i++) {
            if (i != index) this.comments.push(oldList[i]);
        }
    }

    reload(): void {
        this.isLoading = true;
        this.comments = [];
        this.listInfo = defaultListInfo;
        this.loadData();
    }

    protected readonly faPencil = faPencil;
    protected readonly faPaperPlane = faPaperPlane;
}

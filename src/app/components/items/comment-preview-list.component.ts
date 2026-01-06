import { Component, Input, output } from '@angular/core';
import { faPaperPlane, faPencil } from '@fortawesome/free-solid-svg-icons';
import { ExtendedUser } from '../../api/types/users/extended-user';
import { defaultListInfo, RefreshApiListInfo } from '../../api/refresh-api-list-info';
import { Comment } from '../../api/types/comments/comment';
import { CommentComponent } from "./comment.component";
import { ClientService } from '../../api/client.service';
import { BannerService } from '../../banners/banner.service';
import { Level } from '../../api/types/levels/level';
import { User } from '../../api/types/users/user';
import { RefreshApiError } from '../../api/refresh-api-error';
import { DarkContainerComponent } from "../ui/dark-container.component";

@Component({
    selector: 'app-comment-preview-list',
    imports: [
    CommentComponent,
    DarkContainerComponent
],
    template: `
        @if (comments.length > 0) {
            <div class="flex flex-col gap-y-2">
                @for (comment of this.comments; track comment.commentId; let i = $index) {
                    <app-dark-container>
                        <app-comment [comment]="comment" (onDelete)="removeComment(i)"></app-comment>
                    </app-dark-container>
                }
            </div>
        }
        @else {
            <p>No comments yet... Why not post one?</p>
        }
    `,
    styles: ``
})
export class CommentListComponent {
    @Input() ownUser: ExtendedUser | undefined = undefined;

    comments: Comment[] = [];
    listInfo: RefreshApiListInfo = defaultListInfo;
    previewCommentCount: number = 4;

    @Input() level: Level | undefined;
    @Input() profile: User | undefined;
    totalCount = output<number>();

    initialized: boolean = false;

    constructor(protected client: ClientService, protected banner: BannerService) {
        
    }

    ngOnInit() {
        if (!this.initialized) {
            this.initialized = true;
            this.loadData();
        }
    }

    loadData() {
        if (this.comments.length == this.listInfo.totalItems) return; // No more items to fetch;

        let newPage: Comment[] = [];
        
        if (this.level !== undefined) {
            this.client.getLevelComments(this.level.levelId, 0, this.previewCommentCount).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                },
                next: response => {
                    this.comments = response.data.slice(0, this.previewCommentCount);
                    this.listInfo = response.listInfo;
                    this.totalCount.emit(response.listInfo.totalItems);
                }
            });
        }
        else if (this.profile !== undefined) {
            this.client.getProfileComments(this.profile.userId, 0, this.previewCommentCount).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.error("Comment Fetching Failed", apiError == null ? error.message : apiError.message);
                },
                next: response => {
                    this.comments = response.data.slice(0, this.previewCommentCount);
                    this.listInfo = response.listInfo;
                    this.totalCount.emit(response.listInfo.totalItems);
                }
            });
        }
        else {
            this.banner.error("Comment Fetching Failed", "Could not get comments because the commented object is unknown.");
            return;
        }
    }

    removeComment(index: number) {
        this.listInfo.nextPageIndex--;
        this.listInfo.totalItems--;
        this.totalCount.emit(this.listInfo.totalItems);

        let oldList: Comment[] = this.comments;
        this.comments = [];
        for (let i = 0; i < oldList.length; i++) {
            if (i != index) this.comments.push(oldList[i]);
        }
    }

    protected readonly faPencil = faPencil;
    protected readonly faPaperPlane = faPaperPlane;
}

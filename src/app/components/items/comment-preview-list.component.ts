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
import { Observable } from 'rxjs';

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
    @Input() levelChange: Observable<Level> = new Observable();
    @Input() level: Level | undefined;
    @Input() profileChange: Observable<User> = new Observable();
    @Input() profile: User | undefined;

    comments: Comment[] = [];
    listInfo: RefreshApiListInfo = defaultListInfo;
    totalCount = output<number>();
    previewCommentCount: number = 4;

    constructor(protected client: ClientService, protected banner: BannerService) {}

    ngOnInit() {
        // Initial load
        if (this.level !== undefined) {
            this.loadLevel();
        }
        else if (this.profile !== undefined) {
            this.loadProfile();
        }

        // All of this is necessary because if you change the user or level without changing the page, this component
        // will not reload its comments, keeping those from the old profile/level. Aside from the subject/observable,
        // we need to still expose the level/profile attributes themselves as inputs anyway, because the first subject emit
        // doesn't get caught by this component otherwise (sent too early?)
        this.levelChange.pipe().subscribe((newLevel) => {
            if (newLevel && (!this.level || newLevel.levelId !== this.level.levelId)) {
                this.level = newLevel;
                this.loadLevel();
            }
        });

        this.profileChange.pipe().subscribe((newProfile) => {
            if (newProfile && (!this.profile || newProfile.userId !== this.profile.userId)) {
                this.profile = newProfile;
                this.loadProfile();
            }
        });
    }

    private loadLevel() {
        this.client.getLevelComments(this.level!.levelId, 0, this.previewCommentCount).subscribe({
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

    private loadProfile() {
        this.client.getProfileComments(this.profile!.userId, 0, this.previewCommentCount).subscribe({
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

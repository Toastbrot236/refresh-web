import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldTree } from '@angular/forms/signals';
import { isPlatformBrowser } from '@angular/common';
import { Observer } from 'rxjs';
import { SlugPipe } from '../../../pipes/slug.pipe';
import { BannerService } from '../../../banners/banner.service';
import { ClientService, defaultPageSize } from '../../../api/client.service';
import { ListWithData } from '../../../api/list-with-data';
import { defaultListInfo } from '../../../api/refresh-api-list-info';
import { RefreshApiError } from '../../../api/refresh-api-error';
import { User } from '../../../api/types/users/user';
import { PhotoComponent } from '../../items/photo.component';
import { ResponsiveGridComponent } from '../responsive-grid.component';
import { ContainerComponent } from '../container.component';
import { EntityListComponent } from './entity-list.component';
import { Photo } from '../../../api/types/photos/photo';
import { PhotoCategoryRoute } from '../../../api/types/photos/photo-category-route';
import { UserPhotoFormInput } from '../../../forms/user-photo-form-input';
import { InfiniteScrollerComponent } from '../infinite-scroller.component';

@Component({
    selector: 'app-user-photo-list',
    imports: [
    InfiniteScrollerComponent,
    PhotoComponent,
    ResponsiveGridComponent,
    ContainerComponent,
    EntityListComponent,
],
    template: `
        <app-entity-list [list]="currentList" [errorMessage]="errorMessage">
            @if (isPreview) {
                @for (photo of currentList.data; track photo.photoId) {
                    <div class="py-1.5">
                        <app-photo [photo]="photo" [link]="true" />
                    </div>
                }
            }
            @else {
                <app-responsive-grid>
                    @for (photo of this.currentList.data; track photo.photoId) {
                        <app-container [tight]="true">
                            <app-photo [photo]="photo" [link]="true" />
                        </app-container>
                    }
                </app-responsive-grid>

                <app-infinite-scroller [totalLoads]="totalLoads" [isLoading]="this.isLoading" [listInfo]="this.currentList.listInfo" (loadData)="loadNextPage()" />
            }
        </app-entity-list>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// Takes the formField and overwrites its options with defaults or query params, emits the current ListWithData
export class UserPhotoListComponent {
    currentList: ListWithData<Photo> = {
        data: [],
        listInfo: defaultListInfo,
    };

    @Input({required: true}) form: FieldTree<UserPhotoFormInput, string | number, "writable"> = null!;
    @Input() currentListEmitter: Observer<ListWithData<Photo>> | undefined;
    @Input({required: true}) user: User = null!;
    @Input({required: true}) isPreview: boolean = null!;

    errorMessage: string | undefined;

    isLoading: boolean = true;
    totalLoads: number = 0;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected cd: ChangeDetectorRef,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        // not in constructor because we want isPreview to be set to the parent's value, for our first page request
        this.initData();
    }

    initData() {
        this.route.queryParams.subscribe({
            next: query => {
                const category: string | undefined = query['photoCategory'];

                if (category) {
                    switch (category) {
                        case PhotoCategoryRoute.ByUser:
                            this.form.photoCategory().value.set(PhotoCategoryRoute.ByUser);
                            break;
                        case PhotoCategoryRoute.WithUser:
                            this.form.photoCategory().value.set(PhotoCategoryRoute.WithUser);
                            break;
                        default:
                            // default to byUser
                            this.form.photoCategory().value.set(PhotoCategoryRoute.ByUser);
                            break;
                    }
                }
                else {
                    this.form.photoCategory().value.set(PhotoCategoryRoute.ByUser);
                }

                // Manually load the first page (not only needed for preview for some reason).
                // Have to manually increment total loads for this though, so the infinite scroller doesn't download the same page again.
                this.loadNextPage();
                this.totalLoads++;
            }
        });
    }

    loadNextPage() {
        if (!this.user) return;

        const category: PhotoCategoryRoute = this.form.photoCategory().value();

        // TODO consider whether 2 for previews is enough or not.
        // Depending on how wide the user's window is, the photos will automatically scale
        // in a way where 2 photos will cause the photo panel to be either longer or shorter than the level panel.
        let count: number = this.isPreview ? 2 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        this.isLoading = true;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getPhotosRelatedToUserUuid(this.user.userId, category, skip, count).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.errorMessage = apiError == null ? error.message : apiError.message;
                
                this.isLoading = false;
                this.cd.detectChanges();
            },
            next: photoPage => {
                this.currentList.data = this.currentList.data.concat(photoPage.data);
                this.currentList.listInfo = photoPage.listInfo;
                
                this.isLoading = false;
                this.cd.detectChanges();
            }
        });
    }
}

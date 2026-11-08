import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, signal } from '@angular/core';
import { User } from '../../../api/types/users/user';
import { ClientService, defaultPageSize } from '../../../api/client.service';
import { PhotoCategoryPipe } from '../../../pipes/photo-category.pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PhotoComponent } from '../../items/photo.component';
import { FieldTree, form } from '@angular/forms/signals';
import { PhotoCategoryRoute } from '../../../api/types/photos/photo-category-route';
import { ContainerComponent } from '../container.component';
import { ResponsiveGridComponent } from '../responsive-grid.component';
import { BannerService } from '../../../banners/banner.service';
import { RefreshApiError } from '../../../api/refresh-api-error';
import { EntityListComponent } from './entity-list.component';
import { DropdownRadioButtonComponent } from '../form/dropdown-radio-button-group.component';
import { UserLinkComponent } from '../text/links/user-link.component';
import { isPlatformBrowser } from '@angular/common';
import { ListWithData } from '../../../api/list-with-data';
import { Photo } from '../../../api/types/photos/photo';
import { defaultListInfo } from '../../../api/refresh-api-list-info';


interface FilterFormInput {
  photoCategory: PhotoCategoryRoute,
}

@Component({
    selector: 'app-photos-by-user-list',
    imports: [
    ContainerComponent,
    ResponsiveGridComponent,
    EntityListComponent,
    DropdownRadioButtonComponent,
    UserLinkComponent,
    PhotoComponent
],
    template: `
        <app-entity-list title="Photos" [fullPageRouterLink]="'/photos/' + filterForm.photoCategory().value() + '/user/' + user.username"
            [isPreview]="isPreview" [entityList]="currentList">

            <ng-container toTheRightOfTitle class="flex flex-row flex-grow flex-wrap justify-between gap-x-2 gap-y-1">
                <app-dropdown-radio-button-group groupName="photoCategories" [buttonValues]="[
                        photoCategoryRoutes.ByUser,
                        photoCategoryRoutes.WithUser,
                    ]" [textPipe]="categoryPipe" [radioFormField]="filterForm.photoCategory">
                </app-dropdown-radio-button-group>
            
                @if (!isPreview) {
                    <app-user-link class="content-center text-[20px]" [user]="user"></app-user-link>
                }
            </ng-container>

            <ng-container loadingContent>
                <p>Loading photos...</p>
            </ng-container>

            <ng-container noItemsContent>
                <p>No photos found! Try changing your filters...</p>
            </ng-container>

            <ng-container errorContent>
                <p>An error occurred, but we won't tell why, because it'S not implemented yet!</p>
            </ng-container>

            <ng-container listingContent>
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
                }
            </ng-container>
        </app-entity-list>
    `,
    providers: [
        PhotoCategoryPipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

export class PhotosByUserListComponent {
    @Input() isPreview: boolean = false;
    user: User = null!;

    filterInputs = signal<FilterFormInput>({
        photoCategory: PhotoCategoryRoute.ByUser,
    });

    filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);

    currentList: ListWithData<Photo> = {
        data: [],
        listInfo: defaultListInfo,
    };
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected categoryPipe: PhotoCategoryPipe,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object
    ) {
        route.params.subscribe(params => {
            const username: string | undefined = params['username'];
            const category: string | undefined = params['photoCategory'];

            if (username != null) {
                this.client.getUserByUsername(username).subscribe({
                    error: error => {
                        // TODO show on component instead of in a banner
                        const apiError: RefreshApiError | undefined = error.error?.error;
                        this.banner.warn("Failed to get user", apiError == null ? error.message : apiError.message);
                    },
                    next: user => {
                        this.user = user;

                        if (category != null) {
                            switch (category) {
                                case PhotoCategoryRoute.ByUser:
                                    this.filterForm.photoCategory().value.set(PhotoCategoryRoute.ByUser);
                                    break;
                                case PhotoCategoryRoute.WithUser:
                                    this.filterForm.photoCategory().value.set(PhotoCategoryRoute.WithUser);
                                    break;
                                default:
                                    // default to byUser
                                    this.filterForm.photoCategory().value.set(PhotoCategoryRoute.ByUser);
                                    break;
                            }
                        }
                    }
                });
            }
        });

        this.isBrowser = isPlatformBrowser(platformId);
    }

    getPhotos() {
        if (!this.user) return;

        const category: PhotoCategoryRoute = this.filterInputs().photoCategory;

        // TODO consider whether 2 for previews is enough or not.
        // Depending on how wide the user's window is, the photos will automatically scale
        // in a way where 2 photos will cause the photo panel to be either longer or shorter than the level panel.
        let count: number = this.isPreview ? 2 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getPhotosRelatedToUserUuid(this.user.userId, category, skip, count).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to get photos with user", apiError == null ? error.message : apiError.message);
            },
            next: photoPage => {
                this.currentList.data = this.currentList.data.concat(photoPage.data);
                this.currentList.listInfo = photoPage.listInfo;
            }
        });
    }

    protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}

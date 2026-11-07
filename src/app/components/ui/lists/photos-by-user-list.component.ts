import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, signal } from '@angular/core';
import { User } from '../../../api/types/users/user';
import { ClientService } from '../../../api/client.service';
import { PhotoCategoryPipe } from '../../../pipes/photo-category.pipe';
import { ContainerHeaderComponent } from '../container-header.component';
import { PaneTitleComponent } from '../text/pane-title.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DropdownMenuComponent } from '../form/dropdown-menu.component';
import { ButtonComponent } from '../form/button.component';
import { RadioButtonGroupComponent } from '../form/radio-button-group.component';
import { DividerComponent } from '../divider.component';
import { PhotoComponent } from '../../items/photo.component';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { PhotoCategoryRoute } from '../../../api/types/photos/photo-category-route';
import { ContainerComponent } from '../container.component';
import { ResponsiveGridComponent } from '../responsive-grid.component';
import { BannerService } from '../../../banners/banner.service';
import { RefreshApiError } from '../../../api/refresh-api-error';
import { EntityListComponent } from './entity-list.component';
import { DropdownRadioButtonComponent } from '../form/dropdown-radio-button-group.component';
import { UserLinkComponent } from '../text/links/user-link.component';
import { isPlatformBrowser } from '@angular/common';


interface FilterFormInput {
  photoCategory: PhotoCategoryRoute,
}

@Component({
    selector: 'app-photos-by-user-list',
    imports: [
    ContainerHeaderComponent,
    PaneTitleComponent,
    RouterLink,
    DropdownMenuComponent,
    ButtonComponent,
    RadioButtonGroupComponent,
    DividerComponent,
    FormField,
    ContainerComponent,
    ResponsiveGridComponent,
    EntityListComponent,
    DropdownRadioButtonComponent,
    UserLinkComponent,
    PhotoComponent
],
    template: `
        <app-entity-list title="Photos" [fullPageRouterLink]="'/photos/' + filterForm.photoCategory().value() + '/user/' + user.username"
            [isPreview]="isPreview" [totalItemsCount]="currentList.listInfo.TotalItems" [pageLength]="currentList.Data.length"
            [errorHeader]="errorHeader" [errorMessage]="errorMessage">

            <ng-container toTheRightOfTitle class="flex flex-row flex-grow flex-wrap justify-between gap-x-2 gap-y-1">
                <app-dropdown-radio-button-group groupName="photoCategories" [buttonValues]="[
                        photoCategoryRoutes.ByUser,
                        photoCategoryRoutes.WithUser,
                    ]" [textPipe]="categoryPipe" [radioFormField]="filterForm.photoCategory" />
            
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
                    @for (photo of currentList.data; track photo.photoId; let i = $index) {
                        <div class="py-1.5">
                            <app-photo [photo]="photo" [link]="true"></app-photo>
                        </div>
                    }
                }
                @else {
                    <app-responsive-grid>
                        @for (photo of this.currentList.data; track photo.photoId) {
                            <app-container [tight]="true">
                                <app-photo [photo]="photo" [link]="true"></app-photo>
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
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.warn("Failed to get user", apiError == null ? error.message : apiError.message);
                },
                next: user => {
                    this.user = user;

                    if (category != null) {
                        switch (category) {
                            case "by":
                                this.filterForm.photoCategory().value.set(PhotoCategoryRoute.ByUser);
                                break;
                            case "with":
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
        if (this.user == null) return;
        let cachedList: ListWithData<Photo> | undefined;

        const category: PhotoCategoryRoute = this.filterInputs().photoCategory;

        switch (category) {
            case PhotoCategoryRoute.ByUser:
            cachedList = this.photosByUser;
            break;
            case PhotoCategoryRoute.WithUser:
            cachedList = this.photosWithUser;
            break;
            default:
            this.banner.warn("Cannot get photos", "Selected category '" + category + "' is unknown");
            return;
        }
        this.filterForm.photoCategory().value.set(category);

        if (cachedList != null) {
            this.currentPhotos = cachedList;
            return;
        }

        // TODO consider whether 2 is enough or not, depending on how wide the user's window is, the photos will automatically scale
        // in a way where 2 photos will cause the photo panel to be either longer or shorter than the level panel
        this.client.getPhotosRelatedToUserUuid(this.user.userId, category, 0, 2).subscribe({
            error: error => {
            const apiError: RefreshApiError | undefined = error.error?.error;
            this.banner.warn("Failed to get photos with user", apiError == null ? error.message : apiError.message);
            },
            next: photoPage => {
            // cache the page
            switch (category) {
                case PhotoCategoryRoute.ByUser:
                this.photosByUser = this.currentPhotos;
                break;

                case PhotoCategoryRoute.WithUser:
                this.photosWithUser = this.currentPhotos;
                break;
            }

            this.currentPhotos = photoPage;
            }
        });
    }

    protected readonly faChevronDown = faChevronDown;
    protected readonly faChevronUp = faChevronUp;
    protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}

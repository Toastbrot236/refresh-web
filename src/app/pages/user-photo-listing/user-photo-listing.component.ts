import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { User } from '../../api/types/users/user';
import { ClientService, defaultPageSize } from '../../api/client.service';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';
import { ActivatedRoute } from '@angular/router';
import { PhotoComponent } from '../../components/items/photo.component';
import { FieldTree, form } from '@angular/forms/signals';
import { PhotoCategoryRoute } from '../../api/types/photos/photo-category-route';
import { ContainerComponent } from '../../components/ui/container.component';
import { ResponsiveGridComponent } from '../../components/ui/responsive-grid.component';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { EntityListComponent } from '../../components/ui/lists/entity-list.component';
import { DropdownRadioButtonComponent } from '../../components/ui/form/dropdown-radio-button-group.component';
import { UserLinkComponent } from '../../components/ui/text/links/user-link.component';
import { isPlatformBrowser } from '@angular/common';
import { ListWithData } from '../../api/list-with-data';
import { Photo } from '../../api/types/photos/photo';
import { defaultListInfo } from '../../api/refresh-api-list-info';
import { InfiniteScrollerComponent } from '../../components/ui/infinite-scroller.component';


interface FilterFormInput {
  photoCategory: PhotoCategoryRoute,
}

@Component({
    selector: 'app-user-photo-listing',
    imports: [
    ContainerComponent,
    ResponsiveGridComponent,
    EntityListComponent,
    DropdownRadioButtonComponent,
    UserLinkComponent,
    PhotoComponent,
    InfiniteScrollerComponent
],
    templateUrl: './user-photo-listing.component.html',
    providers: [
        PhotoCategoryPipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// This component has inputs because it's intended to also be usable as a component
// on the user info page for the photos preview.
export class UserPhotoListingComponent {
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

    isLoading: boolean = false;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected categoryPipe: PhotoCategoryPipe,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected cd: ChangeDetectorRef
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

    ngOnInit() {
        this.loadNextPage();
    }

    loadNextPage() {
        if (!this.user) return;

        const category: PhotoCategoryRoute = this.filterInputs().photoCategory;

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
                this.banner.warn("Failed to get photos with user", apiError == null ? error.message : apiError.message);
                
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

    protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}

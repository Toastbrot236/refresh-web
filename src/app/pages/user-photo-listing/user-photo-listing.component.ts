import { Component, ChangeDetectionStrategy, Inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { User } from '../../api/types/users/user';
import { ClientService } from '../../api/client.service';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';
import { ActivatedRoute } from '@angular/router';
import { FieldTree, form } from '@angular/forms/signals';
import { PhotoCategoryRoute } from '../../api/types/photos/photo-category-route';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { DropdownRadioButtonComponent } from '../../components/ui/form/dropdown-radio-button-group.component';
import { UserLinkComponent } from '../../components/ui/text/links/user-link.component';
import { isPlatformBrowser } from '@angular/common';
import { UserPhotoFormInput } from '../../forms/user-photo-form-input';
import { PageTitleComponent } from '../../components/ui/text/page-title.component';
import { ContainerHeaderComponent } from '../../components/ui/container-header.component';
import { UserPhotoListComponent } from '../../components/ui/lists/user-photo-list.component';

@Component({
    selector: 'app-user-photo-listing',
    imports: [
    DropdownRadioButtonComponent,
    UserLinkComponent,
    PageTitleComponent,
    ContainerHeaderComponent,
    UserPhotoListComponent
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
    user: User = null!;

    inputs = signal<UserPhotoFormInput>({
        photoCategory: PhotoCategoryRoute.ByUser,
    });
    form: FieldTree<UserPhotoFormInput, string | number, "writable"> = form(this.inputs);

    errorMessage: string | undefined;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected categoryPipe: PhotoCategoryPipe,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected cd: ChangeDetectorRef
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        this.route.params.subscribe(params => {
            const username: string | undefined = params['username'];
            const uuid: string | undefined = params['uuid'];

            this.client.getUserByEitherLookup(username, uuid).subscribe({
                error: error => {
                    // TODO show on component instead of in a banner
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.errorMessage = apiError == null ? error.message : apiError.message;
                },
                next: user => {
                    this.user = user;
                }
            });
        });
    }

    protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}

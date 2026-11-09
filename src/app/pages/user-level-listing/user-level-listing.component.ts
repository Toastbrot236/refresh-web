import { Component, ChangeDetectionStrategy, Inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { User } from '../../api/types/users/user';
import { ClientService, defaultPageSize } from '../../api/client.service';
import { ActivatedRoute } from '@angular/router';
import { FieldTree, form } from '@angular/forms/signals';
import { RefreshApiError } from '../../api/refresh-api-error';
import { DropdownRadioButtonComponent } from '../../components/ui/form/dropdown-radio-button-group.component';
import { UserLinkComponent } from '../../components/ui/text/links/user-link.component';
import { isPlatformBrowser } from '@angular/common';
import { LevelCategoryRoute } from '../../api/types/levels/level-category-route';
import { LevelCategoryPipe } from '../../pipes/level-category.pipe';
import { ContainerHeaderComponent } from '../../components/ui/container-header.component';
import { PageTitleComponent } from '../../components/ui/text/page-title.component';
import { UserLevelListComponent } from '../../components/ui/lists/user-level-list.component';
import { UserLevelFormInput } from '../../forms/user-level-form-input';

@Component({
    selector: 'app-user-level-listing',
    imports: [
    DropdownRadioButtonComponent,
    UserLinkComponent,
    ContainerHeaderComponent,
    PageTitleComponent,
    UserLevelListComponent
],
    templateUrl: './user-level-listing.component.html',
    providers: [
        LevelCategoryPipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// This component has inputs because it's intended to also be usable as a component
// on the user info page for the levels preview.
export class UserLevelListingComponent {
    user: User = null!;

    inputs = signal<UserLevelFormInput>({
        levelCategory: LevelCategoryRoute.ByUser,
    });
    form: FieldTree<UserLevelFormInput, string | number, "writable"> = form(this.inputs);
    
    errorMessage: string | undefined;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected categoryPipe: LevelCategoryPipe,
        private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected cd: ChangeDetectorRef
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        this.route.params.subscribe(params => {
            const username: string | undefined = params['username'];
            const uuid: string | undefined = params['uuid'];

            this.client.getUserByEitherLookup(username, uuid).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.errorMessage = apiError == null ? error.message : apiError.message;
                    this.cd.detectChanges();
                },
                next: user => {
                    this.user = user;
                    this.cd.detectChanges();
                }
            });
        });
    }

    protected readonly levelCategoryRoutes = LevelCategoryRoute;
}

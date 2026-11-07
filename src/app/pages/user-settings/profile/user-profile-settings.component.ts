import { Component, ChangeDetectionStrategy, signal } from "@angular/core";
import { ExtendedUser } from "../../../api/types/users/extended-user";
import { TitleService } from "../../../services/title.service";
import { AuthenticationService } from "../../../api/authentication.service";
import { LayoutService } from "../../../services/layout.service";
import { ClientService } from "../../../api/client.service";
import { ProfileUpdateRequest } from "../../../api/types/users/profile-update-request";
import { PageTitleComponent } from "../../../components/ui/text/page-title.component";
import { TwoPaneLayoutComponent } from "../../../components/ui/layouts/two-pane-layout.component";
import { ContainerComponent } from "../../../components/ui/container.component";
import { FormControl, FormGroup } from "@angular/forms";
import { faFloppyDisk, faPencil } from "@fortawesome/free-solid-svg-icons";
import { PaneTitleComponent } from "../../../components/ui/text/pane-title.component";
import { DividerComponent } from "../../../components/ui/divider.component";
import { sha1Async } from "../../../helpers/crypto";
import { UserAvatarComponent } from "../../../components/ui/photos/user-avatar.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AsyncPipe } from "@angular/common";
import { TextAreaComponent } from "../../../components/ui/form/textarea.component";
import { ButtonComponent } from "../../../components/ui/form/button.component";
import { BannerService } from "../../../banners/banner.service";
import { RefreshApiError } from "../../../api/refresh-api-error";
import { CheckboxComponent } from "../../../components/ui/form/checkbox.component";
import { RadioButtonComponent } from "../../../components/ui/form/radio-button.component";
import { ContentVisibility } from "../../../api/types/content-visibility";
import { RouterLinkComponent } from "../../../components/ui/text/links/router-link.component";
import { FieldTree, form, maxLength } from "@angular/forms/signals";
import { RadioButtonGroupComponent } from "../../../components/ui/form/radio-button-group.component";

interface MetadataFormInput {
    description: string,
    unescapeXML: boolean,
    showModdedLevels: boolean,
    showModdedPlanets: boolean,
    showReuploadedLevels: boolean,
    griefToPhotos: boolean,
    levelVisibility: ContentVisibility,
    profileVisibility: ContentVisibility,
};

@Component({
    selector: 'app-user-profile-settings',
    imports: [
    PageTitleComponent,
    TwoPaneLayoutComponent,
    ContainerComponent,
    TextAreaComponent,
    PaneTitleComponent,
    DividerComponent,
    FaIconComponent,
    AsyncPipe,
    UserAvatarComponent,
    ButtonComponent,
    CheckboxComponent,
    RadioButtonComponent,
    RouterLinkComponent,
    RadioButtonGroupComponent
],
    templateUrl: './user-profile-settings.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

export class UserProfileSettingsComponent {
    ownUser: ExtendedUser | undefined | null;

    profileInputs = signal<MetadataFormInput>({
        // default values, should be overwritten when getting user data anyway
        description: '',
        unescapeXML: false,
        showModdedLevels: true,
        showModdedPlanets: true,
        showReuploadedLevels: true,
        griefToPhotos: false,
        levelVisibility: ContentVisibility.Everyone,
        profileVisibility: ContentVisibility.Everyone,
    });

    // allow 17 chars for username incase it's a fake user which has a 16 character name after prefix
    profileForm: FieldTree<MetadataFormInput, string | number, "writable"> = form(this.profileInputs, (f) => {
        maxLength(f.description, 512, { message: 'Description seems to be too long (max is 512 characters)' });
    });

    iconHash: string = "0";

    protected isMobile: boolean = false;

    constructor(private client: ClientService, private auth: AuthenticationService, protected layout: LayoutService, 
        private bannerService: BannerService) 
    {
        this.auth.user.subscribe(user => {
            if (user) {
                this.updateInputs(user);
                this.ownUser = user;
            }
        });

        this.layout.isMobile.subscribe(v => this.isMobile = v);
    }

    protected getDescriptionIfChanged(): string | undefined {
        if (!this.ownUser) return undefined;
        let newDescription: string = this.profileForm.description().value();
        return newDescription !== this.ownUser.description ? newDescription : undefined;
    }

    updateInputs(user: ExtendedUser) {
        this.ownUser = user;

        this.iconHash = user.iconHash;
        this.profileForm.description().value.set(user.description);

        this.profileForm.unescapeXML().value.set(user.unescapeXmlSequences);
        this.profileForm.showModdedLevels().value.set(user.showModdedContent);
        this.profileForm.showModdedPlanets().value.set(user.showModdedPlanets);
        this.profileForm.showReuploadedLevels().value.set(user.showReuploadedContent);
        this.profileForm.griefToPhotos().value.set(user.redirectGriefReportsToPhotos);

        this.profileForm.levelVisibility().value.set(user.levelVisibility);
        this.profileForm.profileVisibility().value.set(user.profileVisibility);
    }

    uploadChanges() {
        if (this.profileForm().invalid()) return;
        if (!this.ownUser) return;

        let request: ProfileUpdateRequest = {
            description: this.getDescriptionIfChanged(),

            unescapeXmlSequences: this.profileForm.unescapeXML().value(),
            showModdedContent: this.profileForm.showModdedLevels().value(),
            showModdedPlanets: this.profileForm.showModdedPlanets().value(),
            showReuploadedContent: this.profileForm.showReuploadedLevels().value(),
            redirectGriefReportsToPhotos: this.profileForm.griefToPhotos().value(),

            levelVisibility: this.profileForm.levelVisibility().value(),
            profileVisibility: this.profileForm.profileVisibility().value(),
        };

        this.auth.UpdateProfile(request);
    }

    async avatarChanged($event: any) {
        const file: File = $event.target.files[0]
        console.log(file);

        const data: ArrayBuffer = await file.arrayBuffer();
        const hash: string = await sha1Async(data);

        this.client.uploadAsset(hash, data).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.bannerService.warn("Failed to upload your new avatar", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.auth.UpdateUserAvatar(hash);
            }
        });
    }

    avatarErr(img: EventTarget | null): void {
        if(!(img instanceof HTMLImageElement)) return;
        img.srcset = "/assets/missingUser.svg";
    }

    protected readonly faPencil = faPencil;
    protected readonly faFloppyDisk = faFloppyDisk;
    protected readonly contentVisibility = ContentVisibility;
}
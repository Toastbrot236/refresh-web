import { Component, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { faBan, faCamera, faCancel, faCheckCircle, faComment, faEarthAmerica, faFlag, 
    faFloppyDisk, faGavel, faListOl, faPencil, faSignOutAlt, faStar, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import { AsyncPipe } from "@angular/common";
import { UserRoles } from "../../../api/types/users/user-roles";
import { ExtendedUser } from "../../../api/types/users/extended-user";
import { ClientService } from "../../../api/client.service";
import { AuthenticationService } from "../../../api/authentication.service";
import { BannerService } from "../../../banners/banner.service";
import { RefreshApiError } from "../../../api/refresh-api-error";
import { ActivatedRoute } from "@angular/router";
import { AdminUserUpdateRequest } from "../../../api/types/users/admin-user-update-request";
import { LayoutService } from "../../../services/layout.service";
import { CheckboxComponent } from "../../../components/ui/form/checkbox.component";
import { PageTitleComponent } from "../../../components/ui/text/page-title.component";
import { ButtonComponent } from "../../../components/ui/form/button.component";
import { TextAreaComponent } from "../../../components/ui/form/textarea.component";
import { TwoPaneLayoutComponent } from "../../../components/ui/layouts/two-pane-layout.component";
import { ContainerComponent } from "../../../components/ui/container.component";
import { PaneTitleComponent } from "../../../components/ui/text/pane-title.component";
import { RolePipe } from "../../../pipes/role.pipe";
import { DividerComponent } from "../../../components/ui/divider.component";
import { TextboxComponent } from "../../../components/ui/form/textbox.component";
import { PlanetInfo } from "../../../api/types/users/planet-info";
import { LabelComponent } from "../../../components/ui/info/label.component";
import { PunishUserRequest } from "../../../api/types/moderation/punish-user-request";
import { ConfirmationDialogComponent } from "../../../components/ui/confirmation-dialog.component";
import { DarkContainerComponent } from "../../../components/ui/dark-container.component";
import { UserAvatarComponent } from "../../../components/ui/photos/user-avatar.component";
import { FieldTree, form, maxLength, minLength, FormField, required } from "@angular/forms/signals";
import { Observable } from "rxjs";
import { DropdownRadioButtonComponent } from "../../../components/ui/form/dropdown-radio-button-group.component";

interface MetadataFormInput {
    username: string,
    description: string,
    role: UserRoles,
    resetIcon: boolean,
    resetVitaIcon: boolean,
    resetBetaIcon: boolean,
};

interface PunishmentFormInput {
    reason: string,
    expiryDate: string,
};

@Component({
    selector: 'app-admin-user-settings',
    imports: [
    AsyncPipe,
    RolePipe,
    CheckboxComponent,
    PageTitleComponent,
    ButtonComponent,
    TextAreaComponent,
    TwoPaneLayoutComponent,
    ContainerComponent,
    PaneTitleComponent,
    DividerComponent,
    TextboxComponent,
    LabelComponent,
    ConfirmationDialogComponent,
    DarkContainerComponent,
    ReactiveFormsModule,
    UserAvatarComponent,
    FormField,
    DropdownRadioButtonComponent
],
    providers: [
        RolePipe
    ],
    templateUrl: './admin-user-settings.component.html',
    styles: ``
})

export class AdminUserSettingsComponent {
    protected ownUser: ExtendedUser | undefined | null;
    protected targetUser: ExtendedUser | undefined | null;

    metadataInputs = signal<MetadataFormInput>({
        username: '',
        description: '',
        role: UserRoles.User,
        resetIcon: false,
        resetVitaIcon: false,
        resetBetaIcon: false,
    });

    // allow 17 chars for username incase it's a fake user which has a 16 character name after prefix
    metadataForm: FieldTree<MetadataFormInput, string | number, "writable"> = form(this.metadataInputs, (f) => {
        minLength(f.username, 3, { message: 'Username seems to be too short (must be at least 3 characters)' });
        maxLength(f.username, 17, { message: 'Username seems to be too long (max is 16 characters if real user, 17 if fake user)' });
        maxLength(f.description, 512, { message: 'Description seems to be too long (max is 512 characters)' });
    });

    punishmentInputs = signal<PunishmentFormInput>({
        reason: '',
        expiryDate: '',
    });

    // TODO enforce reason length on backend aswell, but for compatibility reasons we will only be able to do so
    // from APIv4 onward.
    punishmentForm: FieldTree<PunishmentFormInput, string | number, "writable"> = form(this.punishmentInputs, (f) => {
        required(f.reason, { message: 'You must enter a punishment reason! Atleast 3 characters required' })
        minLength(f.reason, 3, { message: 'Punishment reason is too short! Atleast 3 characters required' });
    });

    protected showRoleMenu: boolean = false;

    protected planets: PlanetInfo | undefined;
    protected isMobile: boolean = false;

    constructor(private client: ClientService, private auth: AuthenticationService, 
        private banner: BannerService, route: ActivatedRoute, protected layout: LayoutService, private rolePipe: RolePipe) 
    {
        this.auth.user.subscribe(ownUser => {
            if (ownUser && this.ownUser == null) {
                this.ownUser = ownUser;

                if (ownUser.role >= UserRoles.Moderator) {
                    // Only try getting user if we are a signed in moderator or above
                    route.params.subscribe(params => {
                        const username: string | undefined = params['username'];
                        const uuid: string | undefined = params['uuid'];
                        
                        if (uuid !== undefined || username !== undefined) {
                            this.client.getExtendedUserByEitherLookup(username, uuid).subscribe({
                                error: error => {
                                    const apiError: RefreshApiError | undefined = error.error?.error;
                                    this.banner.error("Failed to get extended user", apiError == null ? error.message : apiError.message);
                                },
                                next: user => {
                                    if (user) {
                                        if (ownUser.role < UserRoles.Admin && user.role >= UserRoles.Moderator) {
                                            this.banner.error("You may not update or punish " + user.username, 
                                                "Their role (" + this.rolePipe.transform(user.role) + ") is above your own role (" + this.rolePipe.transform(ownUser.role) + ")");
                                        }
                                        else {
                                            this.updateInputs(user);
                                            this.getPlanets(user.userId);
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
                else {
                    // TODO show this on the empty page, not as a banner
                    this.banner.error("You are not a moderator", "Get out!");
                }
            }
        });

        this.layout.isMobile.subscribe(v => this.isMobile = v);
    }

    protected roleDropdownButtonClick() {
        this.showRoleMenu = !this.showRoleMenu;
    }

    private updateInputs(user: ExtendedUser) {
        this.targetUser = user;

        this.metadataForm.description().value.set(user.description);
        this.metadataForm.username().value.set(user.username);
        this.metadataForm.role().value.set(user.role);

        this.metadataForm.resetIcon().value.set(false);
        this.metadataForm.resetVitaIcon().value.set(false);
        this.metadataForm.resetBetaIcon().value.set(false);
    }

    protected discardChanges() {
        if (!this.targetUser) return;
        this.updateInputs(this.targetUser);
    }

    protected showUpdateDialog: boolean = false;

    protected toggleUpdateDialog(visibility: boolean) {
        this.showUpdateDialog = visibility;
    }

    protected getUsernameIfChanged(): string | null {
        if (!this.targetUser) return null;
        let newUsername: string = this.metadataForm.username().value();
        return newUsername !== this.targetUser.username ? newUsername : null;
    }

    protected getDescriptionIfChanged(): string | null {
        if (!this.targetUser) return null;
        let newDescription: string = this.metadataForm.description().value();
        return newDescription !== this.targetUser.description ? newDescription : null;
    }

    protected getRoleIfChanged(): UserRoles | null {
        if (!this.targetUser) return null;
        let newRole: UserRoles = this.metadataForm.role().value();
        return newRole !== this.targetUser.role ? newRole : null;
    }

    protected uploadMetadataChanges() {
        if (this.metadataForm().invalid()) return;
        if (!this.targetUser) return;
        this.toggleUpdateDialog(false);

        let request: AdminUserUpdateRequest = {
            role: this.getRoleIfChanged(),
            username: this.getUsernameIfChanged(),
            description: this.getDescriptionIfChanged(),

            // TODO allow setting icons to anything, besides just resetting.
            // don't know when that would be useful, but i made APIv3 allow it for some reason,
            // so might want to implement on the website too.
            iconHash: this.metadataForm.resetIcon().value() ? "0" : null,
            vitaIconHash: this.metadataForm.resetVitaIcon().value() ? "0" : null,
            betaIconHash: this.metadataForm.resetBetaIcon().value() ? "0" : null,
        };

        this.client.updateUserByUuid(this.targetUser.userId, request).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to update this user", apiError == null ? error.message : apiError.message);
            },
            next: response => {
                this.updateInputs(response);
                this.banner.success("Successfully updated " + this.targetUser?.username, "");
            }
        })
    }

    private getPlanets(uuid: string) {
        this.client.getUserPlanetDataByUuid(uuid).subscribe({
            error: error => {
                this.planets = undefined;
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to get planet data", apiError == null ? error.message : apiError.message);
            },
            next: planets => {
                this.planets = planets;
            }
        });
    }

    protected showPlanetResetDialog: boolean = false;

    protected togglePlanetResetDialog(visibility: boolean) {
        this.showPlanetResetDialog = visibility;
    }

    protected resetPlanets() {
        if (!this.targetUser) return;
        this.togglePlanetResetDialog(false);

        this.client.resetUserPlanetDataByUuid(this.targetUser.userId).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to reset this user's planet data", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.banner.success("Successfully reset " + this.targetUser?.username + "'s planets!", "");
                this.planets = {
                    lbp2PlanetsHash: "0",
                    lbp3PlanetsHash: "0",
                    vitaPlanetsHash: "0",
                    betaPlanetsHash: "0",
                    areLbp2PlanetsModded: false,
                    areLbp3PlanetsModded: false,
                    areVitaPlanetsModded: false,
                    areBetaPlanetsModded: false,
                };
            }
        });
    }

    protected showRestrictionDialog: boolean = false;

    private resetPunishmentForm() {
        this.punishmentForm.reason().value.set("");
        this.punishmentForm.expiryDate().value.set("");
    }

    protected toggleRestrictionDialog(visibility: boolean) {
        this.showRestrictionDialog = visibility;
    }

    protected restrictUser() {
        if (!this.targetUser) return;
        this.uploadPunishment(this.client.restrictUserByUuid, UserRoles.Restricted, "Failed to restrict " + this.targetUser.username + "!", "Successfully restricted " + this.targetUser.username + "!");
    }
    
    private overrideRole(input: UserRoles) {
        if (!this.targetUser) return;
        this.targetUser.role = input;
        this.metadataForm.role().value.set(input);
    }

    // TODO all this dialog boilerplate stuff should be deduplicated and moved to a component already
    protected showBanDialog: boolean = false;

    protected toggleBanDialog(visibility: boolean) {
        this.showBanDialog = visibility;
    }

    protected banUser() {
        if (!this.targetUser) return;
        this.uploadPunishment(this.client.banUserByUuid, UserRoles.Banned, "Failed to ban " + this.targetUser.username + "!", "Successfully banned " + this.targetUser.username + "!");
    }

    protected uploadPunishment(apiCallback: (userId: string, punishmentData: PunishUserRequest) => Observable<Response>, resultingRole: UserRoles, failMessageHead: string, successMessageHead: string) {
        if (this.punishmentForm().invalid()) {
            return;
        }
        if (!this.targetUser) return;

        this.waitingForPunishmentResponse = true;
        this.toggleRestrictionDialog(false);
        this.toggleBanDialog(false);

        let punishmentData: PunishUserRequest = {
            reason: this.punishmentForm.reason().value(),
            // Must wrap this in a new Date, else the timestamp wont include Z, making Bunkum's serializer add its local timezone offset
            // instead of treating the timestamp as UTC. Not only would this modify the actual timestamp, but EF also doesn't
            // support saving timestamps with offsets, so Refresh would throw if it receives a timestamp with either
            // a non-0 offset or one with no offset and no Z.
            expiryDate: new Date(this.punishmentForm.expiryDate().value()),
        };
        apiCallback(this.targetUser.userId, punishmentData).subscribe({
            error: error => {
                this.waitingForPunishmentResponse = false;

                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn(failMessageHead, apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.waitingForPunishmentResponse = false;

                this.overrideRole(resultingRole);
                this.resetPunishmentForm();
                this.banner.success(successMessageHead, "");
            }
        });
    }

    protected showPardonDialog: boolean = false;

    protected togglePardonDialog(visibility: boolean) {
        this.showPardonDialog = visibility;
    }

    protected pardonUser() {
        if (!this.targetUser) return;
        this.waitingForPunishmentResponse = true;
        this.togglePardonDialog(false);

        this.client.pardonUserByUuid(this.targetUser.userId).subscribe({
            error: error => {
                this.waitingForPunishmentResponse = false;
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to pardon this user", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.waitingForPunishmentResponse = false;
                this.overrideRole(UserRoles.User);
                this.banner.success("Successfully pardoned " + this.targetUser?.username, "");
            }
        });
    }

    protected waitingForPunishmentResponse = false;

    protected showScoreDeleteDialog: boolean = false;

    protected toggleScoreDeleteDialog(visibility: boolean) {
        this.showScoreDeleteDialog = visibility;
    }

    protected deleteScores() {
        if (!this.targetUser) return;
        this.toggleScoreDeleteDialog(false);

        this.client.deleteScoresByUserByUuid(this.targetUser.userId).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to delete this user's scores.", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.banner.success("Successfully deleted " + this.targetUser?.username + "'s scores.", "");
            }
        });
    }

    protected showPhotoDeleteDialog: boolean = false;

    protected togglePhotoDeleteDialog(visibility: boolean) {
        this.showPhotoDeleteDialog = visibility;
    }

    protected deletePhotos() {
        if (!this.targetUser) return;
        this.togglePhotoDeleteDialog(false);

        this.client.deletePhotosByUserByUuid(this.targetUser.userId).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to delete this user's photos.", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.banner.success("Successfully deleted " + this.targetUser?.username + "s photos.", "");
            }
        });
    }

    protected showLevelCommentsDeleteDialog: boolean = false;

    protected toggleLevelCommentsDeleteDialog(visibility: boolean) {
        this.showLevelCommentsDeleteDialog = visibility;
    }

    protected deleteLevelComments() {
        if (!this.targetUser) return;
        this.toggleLevelCommentsDeleteDialog(false);

        this.client.deleteLevelCommentsByUserByUuid(this.targetUser.userId).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to delete this user's level comments.", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.banner.success("Successfully deleted " + this.targetUser?.username + "s level comments.", "");
            }
        });
    }

    protected showProfileCommentsDeleteDialog: boolean = false;

    protected toggleProfileCommentsDialog(visibility: boolean) {
        this.showProfileCommentsDeleteDialog = visibility;
    }

    protected deleteProfileComments() {
        if (!this.targetUser) return;
        this.toggleProfileCommentsDialog(false);

        this.client.deleteProfileCommentsByUserByUuid(this.targetUser.userId).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to delete this user's profile comments.", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.banner.success("Successfully deleted " + this.targetUser?.username + "s profile comments.", "");
            }
        });
    }

    protected showReviewDeleteDialog: boolean = false;

    protected toggleReviewDeleteDialog(visibility: boolean) {
        this.showReviewDeleteDialog = visibility;
    }

    protected deleteReviews() {
        if (!this.targetUser) return;
        this.toggleReviewDeleteDialog(false);

        this.client.deleteReviewsByUserByUuid(this.targetUser.userId).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to delete this user's reviews.", apiError == null ? error.message : apiError.message);
            },
            next: _ => {
                this.banner.success("Successfully deleted " + this.targetUser?.username + "s reviews.", "");
            }
        });
    }

    protected readonly faPencil = faPencil;
    protected readonly faFloppyDisk = faFloppyDisk;
    protected readonly faTrash = faTrash;
    protected readonly faUser = faUser;
    protected readonly faCancel = faCancel;
    protected readonly faSignOutAlt = faSignOutAlt;
    protected readonly faGavel = faGavel;
    protected readonly faBan = faBan;
    protected readonly faFlag = faFlag;
    protected readonly faCheckCircle = faCheckCircle;
    protected readonly faEarthAmerica = faEarthAmerica;
    protected readonly faCamera = faCamera;
    protected readonly faListOl = faListOl;
    protected readonly faComment = faComment;
    protected readonly faStar = faStar;
    protected readonly userRoles = UserRoles;
}
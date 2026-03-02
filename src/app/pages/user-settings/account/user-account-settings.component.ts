import { Component } from "@angular/core";
import { ExtendedUser } from "../../../api/types/users/extended-user";
import { AuthenticationService } from "../../../api/authentication.service";
import { LayoutService } from "../../../services/layout.service";
import { ClientService } from "../../../api/client.service";
import { PageTitleComponent } from "../../../components/ui/text/page-title.component";
import { TwoPaneLayoutComponent } from "../../../components/ui/layouts/two-pane-layout.component";
import { ContainerComponent } from "../../../components/ui/container.component";
import { FormControl, FormGroup } from "@angular/forms";
import { faDesktop, faEnvelope, faFloppyDisk, faGamepad, faKey, faPencil } from "@fortawesome/free-solid-svg-icons";
import { PaneTitleComponent } from "../../../components/ui/text/pane-title.component";
import { DividerComponent } from "../../../components/ui/divider.component";
import { UserAvatarComponent } from "../../../components/ui/photos/user-avatar.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AsyncPipe } from "@angular/common";
import { TextAreaComponent } from "../../../components/ui/form/textarea.component";
import { ButtonComponent } from "../../../components/ui/form/button.component";
import { BannerService } from "../../../banners/banner.service";
import { CheckboxComponent } from "../../../components/ui/form/checkbox.component";
import { RadioButtonComponent } from "../../../components/ui/form/radio-button.component";
import { RouterLinkComponent } from "../../../components/ui/text/links/router-link.component";
import { AccountUpdateRequest } from "../../../api/types/users/profile-update-request copy";
import { TextboxComponent } from "../../../components/ui/form/textbox.component";

@Component({
    selector: 'app-user-account-settings',
    imports: [
    PageTitleComponent,
    TwoPaneLayoutComponent,
    ContainerComponent,
    TextAreaComponent,
    TextboxComponent,
    PaneTitleComponent,
    DividerComponent,
    FaIconComponent,
    AsyncPipe,
    UserAvatarComponent,
    ButtonComponent,
    CheckboxComponent,
    RadioButtonComponent,
    RouterLinkComponent
],
    templateUrl: './user-account-settings.component.html',
    styles: ``
})

export class UserAccountSettingsComponent {
    ownUser: ExtendedUser | undefined | null;
    settingsForm = new FormGroup({
        email: new FormControl(),
        allowPsnAuth: new FormControl(),
        allowRpcnAuth: new FormControl(),
        allowIpAuth: new FormControl(),
    });

    iconHash: string = "0";

    hasEmailChanged: boolean = false;
    hasPsnAuthToggleChanged: boolean = false;
    hasRpcnAuthToggleChanged: boolean = false;
    hasIpAuthToggleChanged: boolean = false;
    hasPendingChanges: boolean = false;

    protected isMobile: boolean = false;

    constructor(private auth: AuthenticationService, protected layout: LayoutService, 
        private banner: BannerService) 
    {
        this.auth.user.subscribe(user => {
            if (user) {
                this.updateInputs(user);
                this.ownUser = user;
            }
        });

        this.layout.isMobile.subscribe(v => this.isMobile = v);
    }

    checkEmailChanges() {
        this.hasEmailChanged = this.settingsForm.controls.email.getRawValue() !== this.ownUser?.emailAddress;
        this.doesPageHavePendingChanges();
    }

    checkPsnAuthToggleChanges() {
        this.hasPsnAuthToggleChanged = this.settingsForm.controls.allowPsnAuth.getRawValue() !== this.ownUser?.psnAuthenticationAllowed;
        this.doesPageHavePendingChanges();
    }

    checkRpcnAuthToggleChanges() {
        this.hasRpcnAuthToggleChanged = this.settingsForm.controls.allowRpcnAuth.getRawValue() !== this.ownUser?.rpcnAuthenticationAllowed;
        this.doesPageHavePendingChanges();
    }

    checkIpAuthTogglePlanetsChanges() {
        this.hasIpAuthToggleChanged = this.settingsForm.controls.allowIpAuth.getRawValue() !== this.ownUser?.allowIpAuthentication;
        this.doesPageHavePendingChanges();
    }

    doesPageHavePendingChanges() {
        this.hasPendingChanges =
            this.hasEmailChanged
            || this.hasPsnAuthToggleChanged
            || this.hasRpcnAuthToggleChanged
            || this.hasIpAuthToggleChanged;
    }

    updateInputs(user: ExtendedUser) {
        this.hasPendingChanges = false;

        this.settingsForm.controls.email.setValue(user.emailAddress);
        this.settingsForm.controls.allowPsnAuth.setValue(user.psnAuthenticationAllowed);
        this.settingsForm.controls.allowRpcnAuth.setValue(user.rpcnAuthenticationAllowed);
        this.settingsForm.controls.allowIpAuth.setValue(user.allowIpAuthentication);
    }

    uploadChanges() {
        if (!this.hasPendingChanges) return;

        let request: AccountUpdateRequest = {
            emailAddress: this.settingsForm.controls.email.getRawValue(),
            psnAuthenticationAllowed: this.settingsForm.controls.allowPsnAuth.getRawValue(),
            rpcnAuthenticationAllowed: this.settingsForm.controls.allowRpcnAuth.getRawValue(),
            allowIpAuthentication: this.settingsForm.controls.allowIpAuth.getRawValue(),
        };

        this.auth.UpdateAccount(request);
    }

    protected readonly faPencil = faPencil;
    protected readonly faFloppyDisk = faFloppyDisk;
    protected readonly faGamePad = faGamepad;
    protected readonly faDesktop = faDesktop;
    protected readonly faKey = faKey;
    protected readonly faEnvelope = faEnvelope;
}
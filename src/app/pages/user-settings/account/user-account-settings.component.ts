import { Component } from "@angular/core";
import { ExtendedUser } from "../../../api/types/users/extended-user";
import { AuthenticationService } from "../../../api/authentication.service";
import { LayoutService } from "../../../services/layout.service";
import { TwoPaneLayoutComponent } from "../../../components/ui/layouts/two-pane-layout.component";
import { ContainerComponent } from "../../../components/ui/container.component";
import { FormControl, FormGroup } from "@angular/forms";
import { faCancel, faDesktop, faEnvelope, faFloppyDisk, faGamepad, faKey } from "@fortawesome/free-solid-svg-icons";
import { PaneTitleComponent } from "../../../components/ui/text/pane-title.component";
import { DividerComponent } from "../../../components/ui/divider.component";
import { ButtonComponent } from "../../../components/ui/form/button.component";
import { CheckboxComponent } from "../../../components/ui/form/checkbox.component";
import { RouterLinkComponent } from "../../../components/ui/text/links/router-link.component";
import { AuthUpdateRequest } from "../../../api/types/users/auth-update-request";
import { TextboxComponent } from "../../../components/ui/form/textbox.component";
import { PageTitleComponent } from "../../../components/ui/text/page-title.component";

@Component({
    selector: 'app-user-account-settings',
    imports: [
    TwoPaneLayoutComponent,
    ContainerComponent,
    TextboxComponent,
    PaneTitleComponent,
    DividerComponent,
    ButtonComponent,
    CheckboxComponent,
    RouterLinkComponent,
    PageTitleComponent
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

    hasEmailChanged: boolean = false;
    hasPsnAuthToggleChanged: boolean = false;
    hasRpcnAuthToggleChanged: boolean = false;
    hasIpAuthToggleChanged: boolean = false;
    hasPendingAuthChanges: boolean = false;

    protected isMobile: boolean = false;

    constructor(private auth: AuthenticationService, protected layout: LayoutService) 
    {
        this.auth.user.subscribe(user => {
            if (user) {
                this.updateInputs(user);
            }
        });

        this.layout.isMobile.subscribe(v => this.isMobile = v);
    }

    checkEmailChanges() {
        this.hasEmailChanged = this.settingsForm.controls.email.getRawValue() !== this.ownUser?.emailAddress;
    }

    checkPsnAuthToggleChanges() {
        this.hasPsnAuthToggleChanged = this.settingsForm.controls.allowPsnAuth.getRawValue() !== this.ownUser?.psnAuthenticationAllowed;
        this.doesAuthHavePendingChanges();
    }

    checkRpcnAuthToggleChanges() {
        this.hasRpcnAuthToggleChanged = this.settingsForm.controls.allowRpcnAuth.getRawValue() !== this.ownUser?.rpcnAuthenticationAllowed;
        this.doesAuthHavePendingChanges();
    }

    checkIpAuthTogglePlanetsChanges() {
        this.hasIpAuthToggleChanged = this.settingsForm.controls.allowIpAuth.getRawValue() !== this.ownUser?.allowIpAuthentication;
        this.doesAuthHavePendingChanges();
    }

    doesAuthHavePendingChanges() {
        this.hasPendingAuthChanges =
            this.hasPsnAuthToggleChanged
            || this.hasRpcnAuthToggleChanged
            || this.hasIpAuthToggleChanged;
    }

    updateInputs(user: ExtendedUser) {
        this.hasPendingAuthChanges = false;
        this.ownUser = user;

        this.settingsForm.controls.email.setValue(user.emailAddress);
        this.settingsForm.controls.allowPsnAuth.setValue(user.psnAuthenticationAllowed);
        this.settingsForm.controls.allowRpcnAuth.setValue(user.rpcnAuthenticationAllowed);
        this.settingsForm.controls.allowIpAuth.setValue(user.allowIpAuthentication);
    }

    updateEmailInput(user: ExtendedUser) {
        this.hasPendingAuthChanges = false;

        this.settingsForm.controls.email.setValue(user.emailAddress);
        this.settingsForm.controls.allowPsnAuth.setValue(user.psnAuthenticationAllowed);
        this.settingsForm.controls.allowRpcnAuth.setValue(user.rpcnAuthenticationAllowed);
        this.settingsForm.controls.allowIpAuth.setValue(user.allowIpAuthentication);
    }

    uploadAuthChanges() {
        if (!this.hasPendingAuthChanges) return;

        let request: AuthUpdateRequest = {
            psnAuthenticationAllowed: this.settingsForm.controls.allowPsnAuth.getRawValue(),
            rpcnAuthenticationAllowed: this.settingsForm.controls.allowRpcnAuth.getRawValue(),
            allowIpAuthentication: this.settingsForm.controls.allowIpAuth.getRawValue(),
        };

        this.auth.UpdateAccount(request);
    }

    uploadEmailAddress() {
        if (!this.hasEmailChanged) return;
        this.auth.UpdateAccount(this.settingsForm.controls.email.getRawValue());
    }

    protected readonly faFloppyDisk = faFloppyDisk;
    protected readonly faGamePad = faGamepad;
    protected readonly faDesktop = faDesktop;
    protected readonly faKey = faKey;
    protected readonly faEnvelope = faEnvelope;
    protected readonly faCancel = faCancel;
}
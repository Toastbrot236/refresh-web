import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { FormControl, FormGroup } from '@angular/forms';
import { ExtendedUser } from '../../api/types/users/extended-user';
import { AuthenticationService } from '../../api/authentication.service';
import { TextboxComponent } from '../../components/ui/form/textbox.component';
import { ButtonComponent } from '../../components/ui/form/button.component';
import { sha512Async } from '../../helpers/crypto';
import { PageTitleComponent } from "../../components/ui/text/page-title.component";
import { faCancel, faKey } from '@fortawesome/free-solid-svg-icons';
import { RouterLinkComponent } from "../../components/ui/text/links/router-link.component";

@Component({
    selector: 'app-reset-password',
    imports: [
    TextboxComponent,
    ButtonComponent,
    PageTitleComponent,
    RouterLinkComponent
],
    templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
    ownUser: ExtendedUser | undefined | null;
    form = new FormGroup({
        upperPassword: new FormControl(),
        lowerPassword: new FormControl(),
    });

    isUpperPasswordSet: boolean = false;
    isLowerPasswordSet: boolean = false;
    arePasswordsSet: boolean = false;
    doPasswordsMatch: boolean = false;

    resetToken: string | undefined;

    constructor(private auth: AuthenticationService, route: ActivatedRoute) {
        route.params.subscribe(params => {
            this.resetToken = params['token'];
        });
    }

    protected checkUpperPasswordChanges() {
        this.isUpperPasswordSet = this.form.controls.upperPassword.getRawValue().length >= 8;
        this.checkPasswords();
    }

    protected checkLowerPasswordChanges() {
        this.isLowerPasswordSet = this.form.controls.lowerPassword.getRawValue().length >= 8;
        this.checkPasswords();
    }

    private checkPasswords() {
        this.arePasswordsSet = this.isUpperPasswordSet && this.isLowerPasswordSet;
        this.doPasswordsMatch = this.form.controls.upperPassword.getRawValue() === this.form.controls.lowerPassword.getRawValue();
    }

    protected resetPassword() {
        if (!this.arePasswordsSet || !this.doPasswordsMatch || this.resetToken === undefined) return;
        const password: string = this.form.controls.upperPassword.getRawValue();
            
        sha512Async(password).then(passwordSha512 => {
            this.auth.ResetPassword({
                resetToken: this.resetToken!,
                passwordSha512: passwordSha512
            }, true);
        })
    }

    protected readonly faKey = faKey;
    protected readonly faCancel = faCancel;
}

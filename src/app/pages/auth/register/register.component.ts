import { Component } from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import { AuthenticationService } from "../../../api/authentication.service";
import { PageTitleComponent } from "../../../components/ui/text/page-title.component";
import { FormComponent } from "../../../components/ui/form/form.component";
import { sha512Async } from "../../../helpers/crypto";
import { CredentialVerificationService } from "../../../services/credential-verification.service";
import { ButtonSubmitFormComponent } from "../../../components/ui/form/button-submit-form.component";
import { faEnvelope, faKey, faSignIn, faTriangleExclamation, faUser, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { TextboxComponent } from "../../../components/ui/form/textbox.component";
import { ContainerComponent } from "../../../components/ui/container.component";

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        PageTitleComponent,
        FormComponent,
        ButtonSubmitFormComponent,
        FaIconComponent,
        TextboxComponent
    ],
    templateUrl: './register.component.html'
})

export class RegisterComponent {
    form = new FormGroup({
        username: new FormControl(),
        emailAddress: new FormControl(),
        password: new FormControl(),
        passwordConfirmation: new FormControl()
    })

    constructor(protected auth: AuthenticationService, private credentialVerificationService: CredentialVerificationService) {}

    submit() {
        const username: string = this.form.controls.username.getRawValue();
        const emailAddress: string = this.form.controls.emailAddress.getRawValue();
        const password: string = this.form.controls.password.getRawValue();
        const passwordConfirmation: string = this.form.controls.passwordConfirmation.getRawValue();

        if (!this.credentialVerificationService.verifyPassword(password, passwordConfirmation)) {
            return;
        }

        sha512Async(password).then((passwordSha512 => {
            this.auth.Register(username, emailAddress, passwordSha512);
        }))
    }

    protected readonly faEnvelope = faEnvelope;
    protected readonly faTriangleExclamation = faTriangleExclamation;
    protected readonly faSignIn = faSignIn;
    protected readonly faUser = faUser;
    protected readonly faKey = faKey;
    protected readonly faUserPlus = faUserPlus;
}
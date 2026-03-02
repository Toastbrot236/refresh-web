import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { AuthenticationService } from '../../api/authentication.service';
import { TextboxComponent } from '../../components/ui/form/textbox.component';
import { ButtonComponent } from '../../components/ui/form/button.component';

@Component({
    selector: 'app-verify-email',
    imports: [
        TextboxComponent,
        ButtonComponent,
    ],
    templateUrl: './verify-email.component.html'
})
export class ResetPasswordComponent {
    ownUser: ExtendedUser | undefined | null;
    code: string | undefined;

    constructor(private auth: AuthenticationService, route: ActivatedRoute) {
        route.params.subscribe(params => {
            this.code = params['code'];
        });
    }

    private verifyEmail() {
        if (this.code === undefined || this.ownUser === undefined) return;
        this.auth.VerifyEmail(this.code);
    }
}

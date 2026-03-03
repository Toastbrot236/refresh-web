import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { AuthenticationService } from '../../api/authentication.service';
import { ButtonComponent } from '../../components/ui/form/button.component';
import { PageTitleComponent } from "../../components/ui/text/page-title.component";
import { RouterLinkComponent } from "../../components/ui/text/links/router-link.component";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-verify-email',
    imports: [
    ButtonComponent,
    PageTitleComponent,
    RouterLinkComponent
],
    templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent {
    ownUser: ExtendedUser | undefined | null;
    code: string | undefined;

    constructor(private auth: AuthenticationService, route: ActivatedRoute) {
        this.auth.user.subscribe(user => {
            if (user) {
                this.ownUser = user;
                route.queryParams.subscribe(params => {
                    this.code = params['code'];
                });
            }
        });
    }

    protected verifyEmail() {
        if (this.code === undefined || this.ownUser === undefined) return;
        this.auth.VerifyEmail(this.code, true);
    }

    protected readonly faEnvelope = faEnvelope;
}

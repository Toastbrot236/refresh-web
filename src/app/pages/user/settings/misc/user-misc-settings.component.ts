import { Component } from '@angular/core';
import { ExtendedUser } from '../../../../api/types/users/extended-user';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../../../../services/layout.service';
import { AuthenticationService } from '../../../../api/authentication.service';
import { PageTitleComponent } from '../../../../components/ui/text/page-title.component';

@Component({
  selector: 'app-user-misc-settings',
  standalone: true,
  imports: [
    PageTitleComponent
  ],
  templateUrl: './user-misc-settings.component.html',
  styles: ``
})

export class UserMiscSettingsComponent {
  user: ExtendedUser | undefined | null;

  constructor(private auth: AuthenticationService, route: ActivatedRoute, protected layout: LayoutService) {
    this.auth.user.subscribe(user => {
      this.user = user;
    });
  }
}

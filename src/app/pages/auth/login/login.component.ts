import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {faEnvelope, faKey} from '@fortawesome/free-solid-svg-icons';
import {PageTitleComponent} from "../../../components/ui/text/page-title.component";
import {TextboxComponent} from "../../../components/ui/form/textbox.component";
import {AuthenticationService} from "../../../api/authentication.service";
import {sha512Async} from "../../../helpers/crypto";
import { DividerComponent } from '../../../components/ui/divider.component';
import { ButtonComponent } from '../../../components/ui/form/button.component';
import { form, required, email, FieldTree } from '@angular/forms/signals';

interface LoginFormInput {
  emailAddress: string,
  passwordClear: string,
}

@Component({
    selector: 'app-login',
    imports: [
        PageTitleComponent,
        TextboxComponent,
        DividerComponent,
        ButtonComponent
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './login.component.html'
})
export class LoginComponent {
  inputs = signal<LoginFormInput>({
    emailAddress: '',
    passwordClear: '',
  });

  form: FieldTree<LoginFormInput, string | number, "writable"> = form(this.inputs, (f) => {
    required(f.emailAddress, { message: 'Email is required' });
    email(f.emailAddress, { message: 'Please enter a valid email' });
    required(f.passwordClear, { message: 'Password is required' });
  });
  
  constructor(private auth: AuthenticationService) {}

  submit() {
    const emailAddress = this.form.emailAddress().value();
    const passwordClear = this.form.passwordClear().value();
    
    sha512Async(passwordClear).then(passwordSha512 => {
      this.auth.LogIn(emailAddress, passwordSha512, true);
    })
  }

  protected readonly faEnvelope = faEnvelope;
  protected readonly faKey = faKey;
}

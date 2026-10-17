import { Component, signal } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {faEnvelope, faKey} from '@fortawesome/free-solid-svg-icons';
import {PageTitleComponent} from "../../../components/ui/text/page-title.component";
import {FormComponent} from "../../../components/ui/form/form.component";
import {TextboxComponent} from "../../../components/ui/form/textbox.component";
import {ButtonComponent} from "../../../components/ui/form/button.component";
import {AuthenticationService} from "../../../api/authentication.service";
import {sha512Async} from "../../../helpers/crypto";
import { form, FormField, required, email, FieldTree } from '@angular/forms/signals';

interface LoginFormInput {
  emailAddress: string,
  passwordClear: string,
}

@Component({
    selector: 'app-login',
    imports: [
        PageTitleComponent,
        FormComponent,
        TextboxComponent,
        ButtonComponent,
        FormField,
    ],
    templateUrl: './login.component.html'
})
export class LoginComponent {
  loginModel = signal<LoginFormInput>({
    emailAddress: '',
    passwordClear: '',
  });

  loginForm: FieldTree<LoginFormInput, string | number, "writable"> = form(this.loginModel, (f) => {
    required(f.emailAddress, { message: 'Email is required' });
    email(f.emailAddress, { message: 'Please enter a valid email' });
    required(f.passwordClear, { message: 'Password is required' });
  });
  
  constructor(private auth: AuthenticationService) {}

  submit(event: Event) {
    console.log("Login submit() called");
    event.preventDefault();

    if (this.loginForm().valid()) {
      console.log(this.loginModel())
    }

    this.loginForm.passwordClear

    /*
    const emailAddress: string = this.loginForm.emailAddress.
    const password: string = this.form.controls.password.getRawValue();
    
    sha512Async(password).then(passwordSha512 => {
      this.auth.LogIn(emailAddress, passwordSha512, true);
    })
      */
  }

  protected readonly faEnvelope = faEnvelope;
  protected readonly faKey = faKey;
}

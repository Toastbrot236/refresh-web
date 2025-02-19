import { Injectable } from "@angular/core";
import { BannerService } from "../banners/banner.service";

@Injectable({providedIn: 'root'})
export class CredentialVerificationService {
    constructor(private bannerService: BannerService) {

    }

    public verifyPassword(password: string, passwordConfirmation: string) {
        if (password != passwordConfirmation) {
            this.bannerService.error("Password Mismatch", "The given passwords do not match.");
            return false;
        }

        // From here on we can be sure that both password and passwordConfirmation are equal
        if (password.length < 8) {
            this.bannerService.error("Password too short", "Your password must be at least 8 characters long.");
            return false;
        }

        return true;
    }
}
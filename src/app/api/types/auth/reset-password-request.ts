export interface ResetPasswordRequest {
    passwordSha512: string;
    resetToken: string;
}
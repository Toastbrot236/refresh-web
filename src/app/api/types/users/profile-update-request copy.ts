export interface AccountUpdateRequest {
    emailAddress: string | undefined;
    psnAuthenticationAllowed: boolean | undefined;
    rpcnAuthenticationAllowed: boolean | undefined;
    allowIpAuthentication: boolean | undefined;
}
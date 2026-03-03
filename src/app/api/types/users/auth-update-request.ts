export interface AuthUpdateRequest {
    psnAuthenticationAllowed: boolean | undefined;
    rpcnAuthenticationAllowed: boolean | undefined;
    allowIpAuthentication: boolean | undefined;
}
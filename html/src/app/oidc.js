const env = process.env;

export const oidcSettings = {
    authority: `${env.VUE_APP_AUTHORITY}/${env.VUE_APP_REALM}`,
    clientId: env.VUE_APP_AUTH_CLIENT_ID,
    redirect_uri: env.VUE_APP_BASE_URL + '/oidc',
    responseType: 'code',
    scope: env.VUE_APP_AUTHORITY_SCOPES,
    post_logout_redirect_uri: env.VUE_APP_BASE_URL,
};

import json
import urllib.request
import jwt;
import requests
from django.contrib.auth import get_user_model
from rest_framework.authentication import BasicAuthentication

def get_jwks_url(issuer_url):
    well_known_url = issuer_url + "/.well-known/openid-configuration"
    with urllib.request.urlopen(well_known_url) as response:
        well_known = json.load(response)
    if not 'jwks_uri' in well_known:
        raise Exception('jwks_uri not found in OpenID configuration')
    return well_known['jwks_uri']

def get_userinfo_url(issuer_url):
    well_known_url = issuer_url + "/.well-known/openid-configuration"
    with urllib.request.urlopen(well_known_url) as response:
        well_known = json.load(response)
    if not 'userinfo_endpoint' in well_known:
        raise Exception('userinfo_endpoint not found in OpenID configuration')
    return well_known['userinfo_endpoint']

def decode_and_validate_token(token, jwks_url):
    jwks_client = jwt.PyJWKClient(jwks_url)
    header = jwt.get_unverified_header(token)
    key = jwks_client.get_signing_key(header["kid"]).key
    return jwt.decode(token, key, [header["alg"]], options={"verify_signature": True, "verify_aud": False})

def get_userinfo(token, userinfo_url):
    return requests.get(userinfo_url, headers={"Authorization": f"Bearer {token}"}).json()

class AuthenticationBackend(BasicAuthentication):
    def authenticate(self, request):
        # Get the JWT token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token = auth_header.split('Bearer ')[1]
        jwks_url =  get_jwks_url("https://key.mythictable.com/auth/realms/MythicTable") # the issuer is not in the header of the token
        decoded = decode_and_validate_token(token, jwks_url)
        userinfo_url =  get_userinfo_url("https://key.mythictable.com/auth/realms/MythicTable") # the issuer is not in the header of the token
        userinfo = get_userinfo(token, userinfo_url)
        # Create a new Django user object or retrieve an existing one
        User = get_user_model()
        # The django user does not have profile information but its username is the userid of the profile
        user, created = User.objects.get_or_create(username=userinfo['sub'], email=userinfo['email'])
        if created:
            user.username = userinfo['sub']
            user.email = userinfo['email']
            user.save()
        # Set the userinfo as a custom attribute of the request object
        request.session["userinfo"] = userinfo
        return [user, None]

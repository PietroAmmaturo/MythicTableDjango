from .serializers import ProfileAPISerializer
from .exceptions import ProfileNotFoundException, ProfileNotAuthorizedException, ProfileInvalidException
from .providers import MongoDbProfileProvider
from .utils import ProfileUtils
from MythicTable.views import AuthorizedView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from Campaign.utils import CampaignUtils
from Campaign.providers import MongoDbCampaignProvider
from Collections.providers import MongoDbCollectionProvider

class ProfileProviderView(AuthorizedView):
    client = None
    db_name = None
    profile_provider  = None
    campaign_provider = None
    collection_provider = None
    def __init__(self, campaign_provider=None, collection_provider=None, profile_provider=None, client=None, db_name=None):
        super().__init__()
        self.client = client
        self.db_name = db_name
        self.collection_provider = collection_provider or MongoDbCollectionProvider(self.client, self.db_name)
        self.campaign_provider = campaign_provider or MongoDbCampaignProvider(self.client, self.db_name)
        self.profile_provider = profile_provider or MongoDbProfileProvider(self.client, self.db_name)

class MeView(ProfileProviderView):
    """
    API view for the authenticated user's profile.
    """
    def get(self, request, format=None):
        user_id = request.session.get("userinfo", {}).get("sub")
        if not user_id:
            raise PermissionDenied("User is not authenticated")
        try:
            profile = self.profile_provider.get_by_user_id(user_id=user_id)
        except ProfileNotFoundException:
            profile = self.create_default_profile(user_id, request.session.get("userinfo", {}))
        self.update_groups(request, profile)
        serializer = ProfileAPISerializer(profile)
        return Response(serializer.data)

    def create_default_profile(self, user_id, userinfo):
        groups = userinfo.get("groups", [])
        serializer = ProfileAPISerializer(ProfileUtils.create_default_profile(user_id=user_id, user_name=userinfo.get("preferred_username"), groups=groups))
        serializer = ProfileAPISerializer(data=serializer.data)
        if not serializer.is_valid():
            message = f"The default profile created for user: '{user_id}' is not valid: {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = self.profile_provider.create(serializer.create(validated_data=serializer.validated_data))
        CampaignUtils.create_tutorial_campaign(collection_provider=self.collection_provider, campaign_provider=self.campaign_provider, owner=profile._id)
        return profile

    def update_groups(self, request, profile):
        groups = request.session.get("userinfo", {}).get("groups", [])
        if not groups:
            return
        if not profile.groups or sorted(profile.groups) != sorted(groups):
            profile.groups = groups
            self.profile_provider.update(profile)


class ProfileView(ProfileProviderView):
    """
    API view for a single profile by ID.
    """
    def get(self, request, profileId=None, format=None):
        profile = self.profile_provider.get(profile_id=str(profileId))
        serializer = ProfileAPISerializer(profile)
        return Response(serializer.data)

class ProfileListView(ProfileProviderView):
    def get(self, request):
        # userId is mandatory even if thoose are actually profile Id
        if bool(request.query_params):
            profileIds = request.query_params.getlist('userId')
            profiles = self.get(profileIds)
            serializer = ProfileAPISerializer(profiles, many=True)
            return Response(serializer.data)
        else:
            return Response([])
    
    def put(self, request):
        user_id = request.session["userinfo"]["sub"]
        groups = request.session["userinfo"]["groups"]
        serializer = ProfileAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The profile provided from user: '{user_id}' is not valid; {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = serializer.create(serializer.validated_data)
        id = self.profile_provider.get_by_user_id(user_id)._id
        if not str(id) == str(profile._id):
            raise ProfileNotAuthorizedException(f"User (user_id = '{user_id}', profile_id = '{id}') is not authorized to update profile: '{profile._id}'")
        profile.groups = groups
        serializer = ProfileAPISerializer(self.profile_provider.update(profile))
        return Response(serializer.data)
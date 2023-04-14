from .serializers import ProfileAPISerializer
from .exceptions import ProfileNotFoundException, ProfileNotAuthorizedException, ProfileInvalidException
from .providers import MongoDbProfileProvider
from .utils import ProfileUtils
from MythicTable.views import AuthorizedView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from Campaign.utils import CampaignUtils
class MeView(AuthorizedView):
    """
    API view for the authenticated user's profile.
    """
    def get(self, request, format=None):
        user_id = request.session.get("userinfo", {}).get("sub")
        if not user_id:
            raise PermissionDenied("User is not authenticated")
        try:
            profile = MongoDbProfileProvider.get_by_user_id(user_id=user_id)
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
        profile = MongoDbProfileProvider.create(serializer.create(validated_data=serializer.validated_data))
        CampaignUtils.create_tutorial_campaign(profile._id)
        return profile

    def update_groups(self, request, profile):
        groups = request.session.get("userinfo", {}).get("groups", [])
        if not groups:
            return
        if not profile.groups or sorted(profile.groups) != sorted(groups):
            profile.groups = groups
            MongoDbProfileProvider.update(profile)


class ProfileView(AuthorizedView):
    """
    API view for a single profile by ID.
    """
    def get(self, request, profileId=None, format=None):
        profile = MongoDbProfileProvider.get(profileId)
        serializer = ProfileAPISerializer(profile)
        return Response(serializer.data)

class ProfileListView(AuthorizedView):
    def get(self, request):
        # userId is mandatory even if thoose are actually profile Id
        profileIds = request.query_params.getlist('userId')
        profiles = MongoDbProfileProvider.get(profileIds)
        serializer = ProfileAPISerializer(profiles, many=True)
        return Response(serializer.data)
    
    def put(self, request):
        print(request)
        user_id = request.session["userinfo"]["sub"]
        groups = request.session["userinfo"]["groups"]
        serializer = ProfileAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The profile provided from user: '{user_id}' is not valid; {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = serializer.create(serializer.validated_data)
        id = MongoDbProfileProvider.get_by_user_id(user_id)._id
        if not str(id) == str(profile._id):
            raise ProfileNotAuthorizedException(f"User (user_id = '{user_id}', profile_id = '{id}') is not authorized to update profile: '{profile._id}'")
        profile.groups = groups
        serializer = ProfileAPISerializer(MongoDbProfileProvider.update(profile))
        return Response(serializer.data)
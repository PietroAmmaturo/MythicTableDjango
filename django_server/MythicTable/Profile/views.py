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
        """
        Retrieve the profile of the authenticated user.

        Args:
            request (HttpRequest): The HTTP request object.
            format (str, optional): The format of the response.

        Returns:
            Response: The serialized profile data.

        Raises:
            PermissionDenied: If the user is not authenticated.
        """
        user_id = request.session.get("userinfo", {}).get("sub")
        if not user_id:
            raise PermissionDenied("User is not authenticated")
        try:
            profile = self.profile_provider.get_by_user_id(user_id)
        except ProfileNotFoundException:
            # Create a default profile if not found
            profile = self.create_default_profile(user_id, request.session.get("userinfo", {}))
        self.update_groups(request, profile)
        serializer = ProfileAPISerializer(profile)
        return Response(serializer.data)

    def create_default_profile(self, user_id, userinfo):
        """
        Create a default profile and tutorial campaign for the user if not found.

        Args:
            user_id (str): The ID of the user.
            userinfo (dict): The user information.

        Returns:
            Profile: The created default profile.

        Raises:
            ProfileInvalidException: If the default profile is not valid.
        """
        groups = userinfo.get("groups", [])
        serializer = ProfileAPISerializer(ProfileUtils.create_default_profile(user_id, userinfo.get("preferred_username"), groups))
        serializer = ProfileAPISerializer(data=serializer.data)
        if not serializer.is_valid():
            message = f"The default profile created for user: '{user_id}' is not valid: {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = self.profile_provider.create(serializer.create(serializer.validated_data))
        CampaignUtils.create_tutorial_campaign(self.campaign_provider, self.collection_provider, profile._id)
        return profile

    def update_groups(self, request, profile):
        """
        Update the groups of the profile if they have changed.

        Args:
            request (HttpRequest): The HTTP request object.
            profile (Profile): The profile object.

        Returns:
            None
        """
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
        """
        Retrieve a single profile by its ID.

        Args:
            request (HttpRequest): The HTTP request object.
            profileId (str): The ID of the profile.
            format (str, optional): The format of the response.

        Returns:
            Response: The serialized profile data.

        Raises:
            ProfileNotFoundException: If the profile is not found.
        """        
        profile = self.profile_provider.get(str(profileId))
        serializer = ProfileAPISerializer(profile)
        return Response(serializer.data)

class ProfileListView(ProfileProviderView):
    def get(self, request):
        """
        Retrieve multiple profiles by their IDs.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            Response: The serialized profile data.

        Raises:
            None
        """
        if bool(request.query_params):
            profileIds = request.query_params.getlist('userId')
            profiles = self.get(profileIds)
            serializer = ProfileAPISerializer(profiles, many=True)
            return Response(serializer.data)
        else:
            return Response([])
    
    def put(self, request):
        """
        Update a profile.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            Response: The serialized updated profile data.

        Raises:
            ProfileNotAuthorizedException: If the user is not authorized to update the profile.
            ProfileInvalidException: If the provided profile data is not valid.
        """
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
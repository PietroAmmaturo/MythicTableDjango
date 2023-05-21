from Collections.providers import MongoDbCollectionProvider
from .serializers import CampaignAPISerializer, PlayerAPISerializer, MessageAPISerializer
from .exceptions import CampaignInvalidException, CampaignAddPlayerException
from .providers import MongoDbCampaignProvider
from .utils import CampaignUtils
from .permissions import UserIsMemberOfCampaign, UserOwnsCampaign
from Profile.providers import MongoDbProfileProvider
from MythicTable.views import AuthorizedView
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.reverse import reverse


class CampaignProviderView(AuthorizedView):
    client = None
    db_name = None
    campaign_provider = None
    collection_provider = None
    profile_provider = None

    def __init__(self, profile_provider=None, campaign_provider=None, collection_provider=None, client=None, db_name=None):
        super().__init__()
        self.client = client
        self.db_name = db_name
        self.campaign_provider = campaign_provider or MongoDbCampaignProvider(
            self.client, self.db_name)
        self.collection_provider = collection_provider or MongoDbCollectionProvider(
            self.client, self.db_name)
        self.profile_provider = profile_provider or MongoDbProfileProvider(
            self.client, self.db_name)

    def get_current_user(self, request):
        """
        Retrieve the current user.

        Args:
            request: The request object.

        Returns:
            The current user.
        
        Raises:
            CampaignAddPlayerException: If the profile ID of the user is not a valid player name.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id)._id)
        data = {"id": None, "name": profile_id}
        serializer = PlayerAPISerializer(data=data)
        if not serializer.is_valid():
            message = f"The profile id of user: '{user_id}' is not a valid player name: {serializer.errors}"
            raise CampaignAddPlayerException(message)
        player = serializer.create(serializer.validated_data)
        return player


class CampaignListView(CampaignProviderView):
    def get(self, request):
        """
        Retrieve all campaigns.

        Args:
            request: The request object.

        Returns:
            Response with the serialized campaigns.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id)._id)
        campaigns = self.campaign_provider.get_all(profile_id)
        serializer = CampaignAPISerializer(campaigns, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new campaign.

        Args:
            request: The request object.

        Returns:
            Response with the serialized created campaign.

        Raises:
            CampaignInvalidException: If the provided campaign is not valid.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id)._id)
        serializer = CampaignAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The campaign provided from user: '{user_id}' is not valid: {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign = serializer.create(serializer.validated_data)
        created_campaign = CampaignUtils.create_default_campaign(profile_id,
                                                                 campaign,
                                                                 self.campaign_provider,
                                                                 self.collection_provider)
        serializer = CampaignAPISerializer(created_campaign)
        headers = {'Location': reverse(
            'campaign-detail', args=[str(created_campaign._id)], request=request)}
        return Response(serializer.data, status=HTTP_201_CREATED, headers=headers)


class CampaignView(CampaignProviderView):
    def get(self, request, campaignId=None):
        """
        Retrieve a specific campaign.

        Args:
            request: The request object.
            campaignId: The ID of the campaign.

        Returns:
            Response with the serialized campaign.
        """
        UserIsMemberOfCampaign().has_permission(request, self)
        campaign = self.campaign_provider.get(campaignId)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)

    def put(self, request, campaignId=None):
        """
        Update a specific campaign.

        Args:
            request: The request object.
            campaignId: The ID of the campaign.

        Returns:
            Response with the serialized updated campaign.

        Raises:
            CampaignInvalidException: If the provided campaign is not valid.
        """
        UserOwnsCampaign().has_permission(request, self)
        user_id = request.session["userinfo"]["sub"]
        serializer = CampaignAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The campaign provided from user: '{user_id}' is not valid; {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign = serializer.create(serializer.validated_data)
        serializer = CampaignAPISerializer(
            self.campaign_provider.update(campaignId, campaign))
        return Response(serializer.data)

    def delete(self, request, campaignId=None):
        """
        Delete a specific campaign.

        Args:
            campaignId: The ID of the campaign.

        Returns:
            Response with the serialized deleted campaign.
        """
        UserOwnsCampaign().has_permission(request, self)
        campaign = self.campaign_provider.get(campaignId)
        self.campaign_provider.delete(campaignId)
        serializer = CampaignAPISerializer(campaign)
        self.collection_provider.delete_all_by_campaign(campaignId)
        return Response(serializer.data)

class CampaignJoinView(CampaignProviderView):
    def get(self, request, joinId=None):
        """
        Retrieve a specific campaign by join ID.

        Args:
            request: The request object.
            joinId: The join ID of the campaign.

        Returns:
            Response with the serialized campaign.
        """
        campaign = self.campaign_provider.get_by_join_id(joinId)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)

    def put(self, request, joinId=None):
        """
        Join a specific campaign.

        Args:
            request: The request object.
            joinId: The join ID of the campaign.

        Returns:
            Response with the serialized campaign.
        """
        campaign = self.campaign_provider.get_by_join_id(joinId)
        serializer = CampaignAPISerializer(self.campaign_provider.add_player(
            campaign._id, self.get_current_user(request)))
        return Response(serializer.data)


class CampaignLeaveView(CampaignProviderView):
    def put(self, request, campaignId):
        """
        Remove a player from a campaign.

        Args:
            request: The request object.
            campaignId: The ID of the campaign.

        Returns:
            Response with the serialized campaign.
        """
        UserIsMemberOfCampaign().has_permission(request, self)
        player = self.get_current_user(request)
        campaign = self.campaign_provider.remove_player(campaignId, player)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)


class CampaignForceLeaveView(CampaignProviderView):
    def put(self, request, campaignId, playerId):
        """
        Forcefully remove a player from a campaign.

        Args:
            campaignId: The ID of the campaign.
            playerId: The ID of the player.

        Returns:
            Response with the serialized campaign.

        Raises:
            CampaignInvalidException: If the provided player ID is not valid.
        """
        UserOwnsCampaign().has_permission(request, self)
        campaign = self.campaign_provider.get(campaignId)
        player_data = {"name": f"{playerId}"}
        serializer = PlayerAPISerializer(data=player_data)
        if not serializer.is_valid():
            message = f"The profile id: '{playerId}' is not a valid player name: {serializer.errors}"
            raise CampaignInvalidException(message)
        player = serializer.create(serializer.validated_data)
        campaign = self.campaign_provider.remove_player(campaignId, player)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)


class CampaignMessagesView(CampaignProviderView):
    def get(self, request, campaignId):
        """
        Retrieve messages of a campaign.

        Args:
            request: The request object.
            campaignId: The ID of the campaign.

        Returns:
            Response with the serialized messages.
        """
        UserIsMemberOfCampaign().has_permission(request, self)
        messages = self.campaign_provider.get_messages(campaignId, int(
            request.query_params.get('pageSize', 50)), int(request.query_params.get('page', 1)))
        serializer = MessageAPISerializer(messages, many=True)
        return Response(serializer.data)


class CampaignPlayersView(CampaignProviderView):
    def get(self, request, campaignId):
        """
        Retrieve players of a campaign.

        Args:
            campaignId: The ID of the campaign.

        Returns:
            Response with the serialized players.
        """
        UserIsMemberOfCampaign().has_permission(request, self)
        players = self.campaign_provider.get_players(campaignId)
        serializer = MessageAPISerializer(players, many=True)
        return Response(serializer.data)

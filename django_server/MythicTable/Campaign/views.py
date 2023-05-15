from Collections.providers import MongoDbCollectionProvider
from .serializers import CampaignAPISerializer, PlayerAPISerializer, MessageAPISerializer
from .exceptions import CampaignInvalidException, CampaignAddPlayerException
from .providers import MongoDbCampaignProvider
from .utils import CampaignUtils
from .permissions import UserIsMemberOfCampaign, UserOwnsCampaign
from Profile.providers import MongoDbProfileProvider
from MythicTable.views import AuthorizedView
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.reverse import reverse
from rest_framework.decorators import permission_classes

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
        self.campaign_provider = campaign_provider or MongoDbCampaignProvider(self.client, self.db_name)
        self.collection_provider = collection_provider or MongoDbCollectionProvider(self.client, self.db_name)
        self.profile_provider = profile_provider or MongoDbProfileProvider(self.client, self.db_name)

    def get_current_user(self, request):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id=user_id)._id)
        data = {"id":None, "name":profile_id}
        serializer = PlayerAPISerializer(data=data)
        if not serializer.is_valid():
            message = f"The profile id of user: '{user_id}' is not a valid player name: {serializer.errors}"
            raise CampaignAddPlayerException(message)
        player = serializer.create(serializer.validated_data)
        return player

class CampaignListView(CampaignProviderView):
    def get(self, request):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id=user_id)._id)
        campaigns = self.campaign_provider.get_all(profile_id=profile_id)
        serializer = CampaignAPISerializer(campaigns, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user_id = request.session["userinfo"]["sub"]
        serializer = CampaignAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The campaign provided from user: '{user_id}' is not valid: {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign = serializer.create(serializer.validated_data)
        created_campaign = CampaignUtils.create_default_campaign(owner=self.profile_provider.get_by_user_id(user_id=user_id)._id, campaign=campaign, campaign_provider=self.campaign_provider, collection_provider=self.collection_provider)
        serializer = CampaignAPISerializer(created_campaign)
        headers = {'Location': reverse('campaign-detail', args=[str(created_campaign._id)], request=request)}
        return Response(serializer.data, status=HTTP_201_CREATED, headers=headers)
    
class CampaignView(CampaignProviderView):
    @permission_classes([UserIsMemberOfCampaign])
    def get(self, request, campaignId=None):
        campaign = self.campaign_provider.get(campaignId)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)
    
    @permission_classes([UserOwnsCampaign])
    def put(self, request, campaignId=None):
        user_id = request.session["userinfo"]["sub"]
        serializer = CampaignAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The campaign provided from user: '{user_id}' is not valid; {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign = serializer.create(serializer.validated_data)
        serializer = CampaignAPISerializer(self.campaign_provider.update(campaignId, campaign))
        return Response(serializer.data)
    
    @permission_classes([UserOwnsCampaign])
    def delete(self, request, campaignId=None):
        campaign = self.campaign_provider.get(campaignId)
        self.campaign_provider.delete(campaignId)
        serializer = CampaignAPISerializer(campaign)
        self.collection_provider.delete_all_by_campaign(campaignId)
        return Response(serializer.data)

class CampaignJoinView(CampaignProviderView):
    def get(self, request, joinId=None):
        campaign = self.campaign_provider.get_by_join_id(joinId)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)

    def put(self, request, joinId=None):
        campaign = self.campaign_provider.get_by_join_id(joinId)
        serializer = CampaignAPISerializer(self.campaign_provider.add_player(campaign._id, self.get_current_user(request=request)))
        return Response(serializer.data)

class CampaignLeaveView(CampaignProviderView):
    @permission_classes([UserIsMemberOfCampaign])
    def put(self, request, campaignId, playerId):
        player = self.get_current_user(request=request)
        campaign = self.campaign_provider.remove_player(campaignId, player)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)
    
class CampaignForceLeaveView(CampaignProviderView):
    @permission_classes([UserOwnsCampaign])
    def put(self, request, campaignId, playerId):
        campaign = self.campaign_provider.get(campaignId)
        player_data = {"name" : f"{playerId}"}
        serializer = PlayerAPISerializer(data = player_data)
        if not serializer.is_valid():
            message = f"The profile id: '{playerId}' is not a valid player name: {serializer.errors}"
            raise CampaignInvalidException(message)
        player = serializer.create(serializer.validated_data)
        campaign = self.campaign_provider.remove_player(campaignId, player)
        serializer = CampaignAPISerializer(campaign)
        return Response(serializer.data)
        
class CampaignMessagesView(CampaignProviderView):
    @permission_classes([UserIsMemberOfCampaign])
    def get(self, request, campaignId):
        messages = self.campaign_provider.get_messages(campaignId, int(request.query_params.get('pageSize', 50)), int(request.query_params.get('page', 1)))
        serializer = MessageAPISerializer(messages, many=True)
        return Response(serializer.data)
    
class CampaignPlayersView(CampaignProviderView):
    @permission_classes([UserIsMemberOfCampaign])
    def get(self, campaignId):
        players = self.campaign_provider.get_players(campaignId)
        serializer = MessageAPISerializer(players, many=True)
        return Response(serializer.data)
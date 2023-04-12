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


class CampaignListView(AuthorizedView):
    def get(self, request):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        campaigns = MongoDbCampaignProvider.get_all(profile_id=profile_id)
        serializer = CampaignAPISerializer(campaigns, many=True)
        print(serializer.data)
        return JsonResponse(serializer.data, safe=False)
    
    def post(self, request):
        user_id = request.session["userinfo"]["sub"]
        serializer = CampaignAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The campaign provided from user: '{user_id}' is not valid: {serializer.errors}"
            raise CampaignInvalidException(message)
        print(serializer.validated_data)
        campaign = serializer.create(serializer.validated_data)
        created_campaign = MongoDbCampaignProvider.create(CampaignUtils.create_default_campaign(owner=MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id, campaign=campaign))
        serializer = CampaignAPISerializer(created_campaign)
        print(str(created_campaign._id))
        headers = {'Location': reverse('campaign-detail', args=[str(created_campaign._id)], request=request)}
        return Response(serializer.data, status=HTTP_201_CREATED, headers=headers)
    
class CampaignByIdView(AuthorizedView):
    @permission_classes([UserIsMemberOfCampaign])
    def get(self, request, id=None):
        campaign = MongoDbCampaignProvider.get(id)
        serializer = CampaignAPISerializer(campaign)
        return JsonResponse(serializer.data)
    
    @permission_classes([UserOwnsCampaign])
    def put(self, request, id=None):
        user_id = request.session["userinfo"]["sub"]
        serializer = CampaignAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The campaign provided from user: '{user_id}' is not valid; {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign = serializer.create(serializer.validated_data)
        serializer = CampaignAPISerializer(MongoDbCampaignProvider.update(id, campaign))
        return JsonResponse(serializer.data)
    
    @permission_classes([UserOwnsCampaign])
    def delete(self, request, id=None):
        campaign = MongoDbCampaignProvider.get(id)
        MongoDbCampaignProvider.delete(id)
        serializer = CampaignAPISerializer(campaign)
        return JsonResponse(serializer.data)

class CampaignByJoinIdView(AuthorizedView):
    def get(self, request, joinId=None):
        campaign = MongoDbCampaignProvider.get_by_join_id(joinId)
        serializer = CampaignAPISerializer(campaign)
        return JsonResponse(serializer.data)

    def put(self, request, joinId=None):
        campaign = MongoDbCampaignProvider.get_by_join_id(joinId)
        serializer = CampaignAPISerializer(MongoDbCampaignProvider.add_player(campaign._id, get_current_user(request)))
        return JsonResponse(serializer.data)

class CampaignLeaveView(AuthorizedView):
    permission_classes = [UserIsMemberOfCampaign]
    def put(self, request, id, playerId):
        player = get_current_user()
        campaign = MongoDbCampaignProvider.remove_player(id, player)
        serializer = CampaignAPISerializer(campaign)
        return JsonResponse(serializer.data)
    
class CampaignForceLeaveView(AuthorizedView):
    permission_classes = [UserOwnsCampaign]
    def put(self, request, id, playerId):
        campaign = MongoDbCampaignProvider.get(id)
        player_data = {"name" : f"{playerId}"}
        serializer = PlayerAPISerializer(data = player_data)
        if not serializer.is_valid():
            message = f"The profile id: '{playerId}' is not a valid player name: {serializer.errors}"
            raise CampaignInvalidException(message)
        player = serializer.create(serializer.validated_data)
        campaign = MongoDbCampaignProvider.remove_player(id, player)
        serializer = CampaignAPISerializer(campaign)
        return JsonResponse(serializer.data)
        
class CampaignMessagesView(AuthorizedView):
    permission_classes = [UserIsMemberOfCampaign]
    def get(self, request, id):
        messages = MongoDbCampaignProvider.get_messages(id, request.query_params.get('pageSize', 50), request.query_params.get('page', 1))
        serializer = MessageAPISerializer(messages, many=True)
        return JsonResponse(serializer.data)
    
class CampaignPlayersView(AuthorizedView):
    permission_classes = [UserIsMemberOfCampaign]
    def get(self, id):
        players = MongoDbCampaignProvider.get_players(id)
        serializer = MessageAPISerializer(players, many=True)
        return JsonResponse(serializer.data)
    
def get_current_user(request):
    user_id = request.session["userinfo"]["sub"]
    profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
    serializer = PlayerAPISerializer(data=profile_id)
    if not serializer.is_valid():
        message = f"The profile id of user: '{user_id}' is not a valid player name: {serializer.errors}"
        raise CampaignAddPlayerException(message)
    player = serializer.create(serializer.validated_data)
    return player
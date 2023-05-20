from .providers import MongoDbCollectionProvider
from rest_framework.response import Response
from rest_framework import status
from MythicTable.views import AuthorizedView
from Campaign.permissions import UserIsMemberOfCampaign
from Profile.providers import MongoDbProfileProvider
from Campaign.providers import MongoDbCampaignProvider

class CollectionProviderView(AuthorizedView):
    client = None
    db_name = None
    collection_provider = None
    profile_provider=None
    campaign_provider = None
    def __init__(self, profile_provider=None, campaign_provider = None, collection_provider=None, client=None, db_name=None):
        super().__init__()
        self.client = client
        self.db_name = db_name
        self.campaign_provider = campaign_provider or MongoDbCampaignProvider(self.client, self.db_name)
        self.collection_provider = collection_provider or MongoDbCollectionProvider(self.client, self.db_name)
        self.profile_provider = profile_provider or MongoDbProfileProvider(self.client, self.db_name)

class CollectionView(CollectionProviderView):
    def get(self, request, collection):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id=user_id)._id)
        try:
            data = self.collection_provider.get_list(profile_id, collection)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, collection):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id=user_id)._id)
        try:
            jObject = request.data
            data = self.collection_provider.create(profile_id, collection, jObject)
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CollectionProfileView(CollectionProviderView):
    def put(self, request, collection, profileId):
        patch = request.data
        result = self.collection_provider.update(collection, str(profileId), patch)
        if result > 0:
            return Response(self.collection_provider.get(collection, str(profileId)))
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, collection, profileId):
        number_deleted = self.collection_provider.delete(collection, str(profileId))
        if number_deleted > 0:
            return Response({"numberDeleted": number_deleted})
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
class CollectionCampaignView(CollectionProviderView):
    def get(self, request, collection, campaignId):
        UserIsMemberOfCampaign().has_permission(request, self)
        result = self.collection_provider.get_list_by_campaign(collection, str(campaignId))
        return Response(result)
    
    def put(self, request, collection, campaignId):
        UserIsMemberOfCampaign().has_permission(request, self)
        patch = request.data
        result = self.collection_provider.update(collection, str(campaignId), patch)
        if result > 0:
            return Response(self.collection_provider.get(collection, str(campaignId)))
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, collection, campaignId):
        UserIsMemberOfCampaign().has_permission(request, self)
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id=user_id)._id)
        try:
            item = request.data
            data = self.collection_provider.create_by_campaign(str(profile_id), collection, str(campaignId), item)
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def delete(self, request, collection, campaignId, itemId):
        UserIsMemberOfCampaign().has_permission(request, self)
        try:
            data = self.collection_provider.delete_by_campaign(collection, str(campaignId), str(itemId))
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
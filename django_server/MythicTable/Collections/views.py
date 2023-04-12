from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from MythicTable.views import AuthorizedView
from .providers import MongoDbCollectionProvider
from Campaign.permissions import UserIsMemberOfCampaign
from Campaign.providers import MongoDbCampaignProvider
from Profile.providers import MongoDbProfileProvider

class CollectionView(AuthorizedView):
    def get(request, collection):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        try:
            data = MongoDbCollectionProvider.get_list(profile_id, collection)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(request, collection):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        try:
            jObject = request.data
            data = MongoDbCollectionProvider.create(profile_id, collection, jObject)
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CollectionProfileView(AuthorizedView):
    def put(request, collection, profileId):
        patch = request.data
        result = MongoDbCollectionProvider.update(collection, str(profileId), patch)
        if result > 0:
            return Response(MongoDbCollectionProvider.get(collection, str(profileId)))
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(request, collection, profileId):
        number_deleted = MongoDbCollectionProvider.delete(collection, str(profileId))
        if number_deleted > 0:
            return Response({"numberDeleted": number_deleted})
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
class CollectionCampaignView(AuthorizedView):
    permission_classes = [UserIsMemberOfCampaign]
    def put(request, collection, campaignId):
        patch = request.data
        result = MongoDbCollectionProvider.update(collection, str(campaignId), patch)
        if result > 0:
            return Response(MongoDbCollectionProvider.get(collection, str(campaignId)))
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(request, collection, campaignId):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        try:
            jObject = request.data
            data = MongoDbCollectionProvider.create_by_campaign(str(profile_id), collection, str(campaignId), jObject)
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(request, collection, campaignId, itemId):
        try:
            data = MongoDbCollectionProvider.delete_by_campaign(collection, str(campaignId), str(itemId))
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
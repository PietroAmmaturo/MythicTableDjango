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
        """
        Retrieve a list of items from a collection.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.

        Returns:
            A Response object containing the list of items.

        Raises:
            Exception: If an error occurs during retrieval.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id=user_id)._id)
        try:
            data = self.collection_provider.get_list(profile_id, collection)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, collection):
        """
        Create a new item in a collection.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.

        Returns:
            A Response object containing the created item.

        Raises:
            Exception: If an error occurs during creation.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
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
        """
        Update an item in a collection associated with a profile.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.
            profileId: The ID of the profile.

        Returns:
            A Response object containing the updated item.

        Raises:
            Exception: If an error occurs during update.
        """
        patch = request.data
        result = self.collection_provider.update(collection, str(profileId), patch)
        if result > 0:
            return Response(self.collection_provider.get(collection, str(profileId)))
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, collection, profileId):
        """
        Delete an item from a collection associated with a profile.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.
            profileId: The ID of the profile.

        Returns:
            A Response object containing the number of deleted items.

        Raises:
            Exception: If an error occurs during deletion.
        """
        number_deleted = self.collection_provider.delete(collection, str(profileId))
        if number_deleted > 0:
            return Response({"numberDeleted": number_deleted})
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
class CollectionCampaignView(CollectionProviderView):
    def get(self, request, collection, campaignId):
        """
        Retrieve a list of items from a collection associated with a campaign.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.
            campaignId: The ID of the campaign.

        Returns:
            A Response object containing the list of items.

        Raises:
            Exception: If an error occurs during retrieval.
        """
        UserIsMemberOfCampaign().has_permission(request, self)
        result = self.collection_provider.get_list_by_campaign(collection, str(campaignId))
        return Response(result)
    
    def put(self, request, collection, campaignId):
        """
        Create a new item in a collection associated with a campaign.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.
            campaignId: The ID of the campaign.

        Returns:
            A Response object containing the created item.

        Raises:
            Exception: If an error occurs during creation.
        """
        UserIsMemberOfCampaign().has_permission(request, self)
        patch = request.data
        result = self.collection_provider.update(collection, str(campaignId), patch)
        if result > 0:
            return Response(self.collection_provider.get(collection, str(campaignId)))
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, collection, campaignId):
        """
        Create a new item in a collection associated with a campaign.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.
            campaignId: The ID of the campaign.

        Returns:
            A Response object containing the created item.

        Raises:
            Exception: If an error occurs during creation.
        """
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
        """
        Delete an item from a collection associated with a campaign.

        Args:
            request: The HTTP request object.
            collection: The name of the collection.
            campaignId: The ID of the campaign.
            itemId: The ID of the item.

        Returns:
            A Response object containing the result of the deletion.

        Raises:
            Exception: If an error occurs during deletion.
        """
        UserIsMemberOfCampaign().has_permission(request, self)
        try:
            data = self.collection_provider.delete_by_campaign(collection, str(campaignId), str(itemId))
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
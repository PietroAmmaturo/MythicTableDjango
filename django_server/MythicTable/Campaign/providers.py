from .exceptions import CampaignInvalidException, CampaignNotFoundException
from .models import Campaign
from .serializers import CampaignDBSerializer
import pymongo
from bson import ObjectId

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
for dbn in client.list_database_names():
    print("db", dbn)
    db = client[dbn]
    for coll in db.list_collection_names():
        print("coll", coll)
db = client['admin']
collection = db["campaign"]

class MongoDbCampaignProvider:
    # get using the profile
    def get_all(profile_id: ObjectId):
        # Define the filter
        filter = {"$or": [{"Owner": str(profile_id)}, {"Players.Name": str(profile_id)}]}
        print(profile_id)
        # Find the first document that matches the filter
        dtos = [doc for doc in collection.find(filter)]
        print(dtos)
        # Deserialization
        serializer = CampaignDBSerializer(data=dtos, many=True)
        if not serializer.is_valid():
            print(str(profile_id))
            message = f"The campaigns associated with profile: {profile_id} stored in the DB are not valid: {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign = serializer.create(serializer.validated_data)
        return campaign

    # get using the mongoDB Object id
    def get(campaign_id: ObjectId):
        # Define the filter
        filter = {"_id": campaign_id}
        # Find the first document that matches the filter
        dto = collection.find_one(filter)
        if dto is None:
            message = f"Cannot find campaign: {campaign_id}"
            raise CampaignNotFoundException(message)
        # Deserialization
        serializer = CampaignDBSerializer(data=dto)
        if serializer.is_valid():
            campaign = serializer.create(serializer.validated_data)
            return campaign
        
    def create(campaign):
        # Serialization
        serializer = CampaignDBSerializer(campaign)
        print(serializer.data)
        newProfile = serializer.data
        del newProfile['_id']
        result = collection.insert_one(newProfile)
        if (not result.acknowledged):
            message = f"Unable to create profile, result {result}"
            raise CampaignInvalidException(message)
        campaign._id = result.inserted_id
        return campaign
    
    def get_by_join_id(join_id: str):
        filter = {"JoinId": join_id}
        # Find the first document that matches the filter
        dto = collection.find_one(filter)
        print(dto)
        if dto is None:
            message = f"Cannot find campaign: {join_id}"
            raise CampaignNotFoundException(message)
        # Deserialization
        serializer = CampaignDBSerializer(data=dto)
        if serializer.is_valid():
            campaign = serializer.create(serializer.validated_data)
            return campaign
    
    def get_players(campaign_id: str):
        try:
            campaign = MongoDbCampaignProvider.get(campaign_id)
            return campaign.players
        except CampaignNotFoundException:
            raise CampaignNotFoundException(f"Get Players. Cannot find campaign with join id {campaignId}")

from .serializers import ProfileAPISerializer
from .exceptions import ProfileNotFoundException, ProfileNotAuthorizedException, ProfileInvalidException
from .providers import MongoDbProfileProvider
from .utils import ProfileUtils
from MythicTable.views import AuthorizedView
from django.http import JsonResponse

class Me(AuthorizedView):
    def get(self, request):
        user_id = request.session["userinfo"]["sub"]
        user_name = request.session["userinfo"]["preferred_username"]
        groups = request.session["userinfo"]["groups"]
        try:
            profile = MongoDbProfileProvider.get_by_user_id(user_id=user_id)
            update_groups(request, profile)
            serializer = ProfileAPISerializer(profile)
            return JsonResponse(serializer.data)
        except ProfileNotFoundException:
            #await first_time_setup(profile.id)
            # creating API serializer to connvert the default id from id to string
            serializer = ProfileAPISerializer(ProfileUtils.create_default_profile(user_id=user_id, user_name=user_name, groups=groups))
            # creating a serializer from the data of the previous one
            serializer = ProfileAPISerializer(data=serializer.data)
            if not serializer.is_valid():
                message = f"Thedefault  profile created for user: '{user_id}' is not valid: {serializer.errors}"
                raise ProfileInvalidException(message)
            # creating an instance and passing it to the provider to store it in the DB (with a proper id)
            profile = MongoDbProfileProvider.create(serializer.create(validated_data=serializer.validated_data))
            # serialization
            serializer = ProfileAPISerializer(profile)
            return JsonResponse(serializer.data)

class ProfileView(AuthorizedView):
    def get(self, userId=None):
        profile = MongoDbProfileProvider.get(userId)
        serializer = ProfileAPISerializer(profile)
        return JsonResponse(serializer.data)


class ProfileListView(AuthorizedView):
    def get(self, request):
        userIds = request.query_params.getlist('userId')
        profiles = MongoDbProfileProvider.get(userIds)
        serializer = ProfileAPISerializer(profiles, many=True)
        return JsonResponse(serializer.data)
    
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
        return JsonResponse(serializer.data)
    
def update_groups(request, profile):
        groups = request.session["userinfo"]["groups"]
        if(len(groups) == 0 and profile.groups == None):
            return True
        elif ((profile.groups == None) or sorted(profile.groups) != sorted(groups)):
            profile.groups = groups
            MongoDbProfileProvider.update(profile)
        return True

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
            profile = MongoDbProfileProvider.create(ProfileUtils.create_default_profile(user_id=user_id, user_name=user_name, groups=groups))
            serializer = ProfileAPISerializer(profile)
            return JsonResponse(serializer.data)

class ProfileView(AuthorizedView):
    def get(self, request, userId=None):
        if userId:
            profile = MongoDbProfileProvider.get(userId)
            serializer = ProfileAPISerializer(profile)
            return JsonResponse(serializer.data)
        else:
            userIds = request.query_params.getlist('userId')
            profiles = MongoDbProfileProvider.get(userIds)
            serializer = ProfileAPISerializer(profiles, many=True)
            return JsonResponse(serializer.data)

    def put(self, request):
        user_id = request.session["userinfo"]["sub"]
        groups = request.session["userinfo"]["groups"]
        serializer = ProfileAPISerializer(data=request.data)
        if not serializer.is_valid():
            message = f"The profile provided from user: '{user_id}' is not valid; {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = serializer.create()
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

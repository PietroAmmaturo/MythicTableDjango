from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
from Profile.serializers import UserSerializer, GroupSerializer
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from os import environ
import json
import urllib.request
import jwt;
from django.contrib.auth.decorators import login_required
from .models import Profile
from .exceptions import ProfileNotFoundException
from .providers import MongoDbProfileProvider
from django.http import JsonResponse


@api_view(['GET', 'POST'])
@login_required
def me(request):
    print(request.user)
    userId = request.userinfo["sub"]
    try:
        profile = MongoDbProfileProvider.getByUserId(userId=userId)
        #await updateGroups(profile)
        return JsonResponse(profile.__dict__)
    except ProfileNotFoundException:
        # TODO - Come up with a better way create a display name 
        # https://gitlab.com/mythicteam/mythictable/-/issues/145
        userName = request.userinfo["preferred_username"]
        displayName = userName.split("@")[0] if "@" in userName else userName
        profile = Profile(userId=userId, displayName=displayName, imageUrl="", hasSeenFPSplash=False, hasSeenKSSplash=False, groups="")
        #await first_time_setup(profile.id)
        return JsonResponse(profile.__dict__)

class MyView(APIView):
    def get(self, request, *args, **kwargs):
        current_user = request.user
        return Response('authenticated with username (email): ' + current_user.username)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]



class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


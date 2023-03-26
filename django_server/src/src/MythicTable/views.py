from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
from src.MythicTable.serializers import UserSerializer, GroupSerializer
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


from rest_framework.views import APIView
from rest_framework import permissions
from django.contrib.auth.mixins import LoginRequiredMixin
from MythicTable.authentication import AuthenticationBackend

class AuthorizedView(APIView, LoginRequiredMixin):
    authentication_classes = [AuthenticationBackend]
    permission_classes = [permissions.IsAuthenticated]

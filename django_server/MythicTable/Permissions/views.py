from .serializers import PermissionsAPISerializer
from .providers import MongoDbPermissionsProvider
from MythicTable.views import AuthorizedView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

class PermissionsView(AuthorizedView):
    def get(campaign_id: str):
        return MongoDbPermissionsProvider.get_list(campaign_id=campaign_id)

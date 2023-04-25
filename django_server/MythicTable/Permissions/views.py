from .serializers import PermissionsAPISerializer
from .providers import MongoDbPermissionProvider
from MythicTable.views import AuthorizedView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

class PermissionProviderView(AuthorizedView):
    client = None
    db_name = None
    permission_provider = None
    def __init__(self, permission_provider=None, client=None, db_name=None):
        super().__init__()
        self.client = client
        self.db_name = db_name
        self.permission_provider = permission_provider or MongoDbPermissionProvider(self.client, self.db_name)
        
class PermissionsView(PermissionProviderView):
    def get(self, campaign_id: str):
        return self.get_list(campaign_id=campaign_id)

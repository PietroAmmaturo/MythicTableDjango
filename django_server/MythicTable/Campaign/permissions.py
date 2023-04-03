from rest_framework.permissions import BasePermission
from .exceptions import UserIsNotInCampaignException, UserDoesNotOwnCampaignException
from .providers import MongoDbCampaignProvider
from Profile.providers import MongoDbProfileProvider

class UserIsMemberOfCampaign(BasePermission):
    def has_permission(self, request, view):
        campaign_id = self.kwargs.get("id")
        current_user = request.session['userinfo']['user_id']

        campaign = MongoDbCampaignProvider.get(campaign_id)
        profile_id = MongoDbProfileProvider.get_by_user_id(current_user)
        players = MongoDbCampaignProvider.get_players(campaign_id)

        if campaign.owner != profile_id and not any(player.name == profile_id for player in players):
            raise UserIsNotInCampaignException(campaign_id)

        return True
    
class UserOwnsCampaign(BasePermission):
    def has_permission(self, request, view):
        campaign_id = self.kwargs.get("id")
        current_user = request.session['userinfo']['user_id']

        campaign = MongoDbCampaignProvider.get(campaign_id)
        profile_id = MongoDbProfileProvider.get_by_user_id(current_user)

        if campaign.owner != profile_id:
            raise UserDoesNotOwnCampaignException(campaign_id)

        return True
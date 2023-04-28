from rest_framework.permissions import BasePermission
from .exceptions import UserIsNotInCampaignException, UserDoesNotOwnCampaignException
from .providers import MongoDbCampaignProvider
from Profile.providers import MongoDbProfileProvider

class UserIsMemberOfCampaign(BasePermission):
    def has_permission(self, request, view):
        print("checking user is member of campaign")
        campaign_id = self.kwargs.get("campaignId")
        current_user = request.session['userinfo']['user_id']

        campaign = view.campaign_provider.get(campaign_id)
        profile_id = view.profile_provider.get_by_user_id(current_user)
        players = view.campaign_provider.get_players(campaign_id)

        if campaign.owner != profile_id and not any(player.name == profile_id for player in players):
            raise UserIsNotInCampaignException(campaign_id)

        return True
    
class UserOwnsCampaign(BasePermission):
    def has_permission(self, request, view):
        print("checking user is owner of campaign")
        campaign_id = self.kwargs.get("campaignId")
        current_user = request.session['userinfo']['user_id']

        campaign = view.campaign_provider.get(campaign_id)
        profile_id = view.profile_provider.get_by_user_id(current_user)

        if campaign.owner != profile_id:
            raise UserDoesNotOwnCampaignException(campaign_id)

        return True
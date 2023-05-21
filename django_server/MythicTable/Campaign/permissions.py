from rest_framework.permissions import BasePermission
from .exceptions import UserIsNotInCampaignException, UserDoesNotOwnCampaignException

class UserIsMemberOfCampaign(BasePermission):
    def has_permission(self, request, view):
        campaign_id = view.kwargs.get("campaignId")
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        current_user = request.session['userinfo']['sub']

        campaign = view.campaign_provider.get(campaign_id)
        profile_id = str(view.profile_provider.get_by_user_id(current_user)._id)
        players = view.campaign_provider.get_players(campaign_id)
        if campaign.owner != profile_id and not any(player.name == profile_id for player in players):
            raise UserIsNotInCampaignException(campaign_id)

        return True
    
class UserOwnsCampaign(BasePermission):
    def has_permission(self, request, view):
        campaign_id = view.kwargs.get("campaignId")
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        current_user = request.session['userinfo']['sub']

        campaign = view.campaign_provider.get(campaign_id)
        profile_id = str(view.profile_provider.get_by_user_id(current_user)._id)
        if campaign.owner != profile_id:
            raise UserDoesNotOwnCampaignException(campaign_id)

        return True
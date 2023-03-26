using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc.Filters;

using MythicTable.Campaign.Exceptions;

namespace MythicTable.Filters
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class UserIsMemberOfCampaign : GenericFilter
    {
        private string pathVariable;
        public UserIsMemberOfCampaign(string key = "id")
        {
            pathVariable = key;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var campaignProvider = this.GetCampaignProvider(context);
            var profileProvider = this.GetProfileProvider(context);
            string campaignId = this.GetPathVariable<string>(context, pathVariable);
            var currentUser = this.GetCurrentUser(context);

            var campaign = await campaignProvider.Get(campaignId);
            var profileId = await profileProvider.GetProfileId(currentUser);
            var players = await campaignProvider.GetPlayers(campaignId);

            if( campaign.Owner != profileId && players.FindAll(player => player.Name == profileId).Count <= 0 ) {
                throw new UserIsNotInCampaignException(campaignId);
            }

            await next();
        }
    }

    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class UserOwnsCampaign : GenericFilter
    {
        private string pathVariable;

        public UserOwnsCampaign(string key = "id")
        {
            pathVariable = key;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var campaignProvider = this.GetCampaignProvider(context);
            var profileProvider = this.GetProfileProvider(context);
            string campaignId = this.GetPathVariable<string>(context, pathVariable);
            var currentUser = this.GetCurrentUser(context);

            var campaign = await campaignProvider.Get(campaignId);
            var profileId = await profileProvider.GetProfileId(currentUser);

            if(campaign.Owner != profileId) {
                throw new UserDoesNotOwnCampaignException(campaignId);
            }
            await next();
        }
    }
}
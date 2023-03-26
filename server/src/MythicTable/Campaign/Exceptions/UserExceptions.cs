using System;
using System.Net;

using MythicTable.Common.Exceptions;

namespace MythicTable.Campaign.Exceptions
{
    public class UserIsNotInCampaignException : Exception, IMythicTableException
    {
        public UserIsNotInCampaignException(string campaignId) : base($"You are not a member of campaign \"{campaignId}\"") { }
        public virtual HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
    }

    public class UserDoesNotOwnCampaignException : Exception, IMythicTableException
    {
        public UserDoesNotOwnCampaignException(string campaignId) : base($"You do not own campaign \"{campaignId}\"") { }

        public virtual HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;

    }
}
using MythicTable.Common.Exceptions;
using System.Net;

namespace MythicTable.Campaign.Exceptions
{
    public class CampaignNotFoundException : MythicTableException
    {
        public CampaignNotFoundException(string msg) : base(msg) { }

        public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
    }
}
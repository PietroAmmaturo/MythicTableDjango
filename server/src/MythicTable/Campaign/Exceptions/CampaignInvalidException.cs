using MythicTable.Common.Exceptions;

namespace MythicTable.Campaign.Exceptions
{
    public class CampaignInvalidException : MythicTableException
        {
            public CampaignInvalidException(string msg): base(msg) {}
        }
}
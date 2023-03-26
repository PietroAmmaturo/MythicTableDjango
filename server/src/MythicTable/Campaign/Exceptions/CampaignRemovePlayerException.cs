using MythicTable.Common.Exceptions;

namespace MythicTable.Campaign.Exceptions
{
    public class CampaignRemovePlayerException : MythicTableException
        {
            public CampaignRemovePlayerException(string msg): base(msg) {}
        }
}
using MythicTable.Common.Exceptions;

namespace MythicTable.Campaign.Exceptions
{
    public class CampaignAddPlayerException : MythicTableException
        {
            public CampaignAddPlayerException(string msg): base(msg) {}
        }
}
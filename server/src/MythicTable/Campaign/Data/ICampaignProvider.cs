using System.Collections.Generic;
using System.Threading.Tasks;

namespace MythicTable.Campaign.Data
{
    public interface ICampaignProvider
    {
        Task<List<CampaignDTO>> GetAll(string userId);
        Task<CampaignDTO> Get(string campaignId);
        Task<CampaignDTO> GetByJoinId(string joinId);
        Task<CampaignDTO> Create(CampaignDTO campaign, string owner);
        Task<CampaignDTO> Update(string id, CampaignDTO campaign);
        Task Delete(string id);
        Task<List<PlayerDTO>> GetPlayers(string campaignId);
        Task<CampaignDTO> AddPlayer(string campaignId, PlayerDTO player);
        Task<CampaignDTO> RemovePlayer(string campaignId, PlayerDTO player);
        
        Task<List<MessageDto>> GetMessages(string campaignId, int pageSize = 50, int page = 1);
        Task<MessageDto> AddMessage(string campaignId, MessageDto message);
    }
}
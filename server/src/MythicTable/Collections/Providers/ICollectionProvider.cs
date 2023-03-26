using Microsoft.AspNetCore.JsonPatch;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MythicTable.Collections.Providers
{
    public interface ICollectionProvider
    {
        Task<JObject> Create(string userId, string collection, JObject jObject);
        Task<List<JObject>> GetList(string userId, string collection);
        Task<JObject> Get(string userId, string collection, string id);
        Task<int> Delete(string userId, string collection, string id);
        Task<int> Update(string userId, string collection, string id, JsonPatchDocument patch);

        Task<JObject> CreateByCampaign(string userId, string collection, string campaignId, JObject jObject);

        Task<List<JObject>> GetListByCampaign(string collection, string campaignId);
        Task<JObject> GetByCampaign(string collection, string campaignId, string id);
        Task<int> UpdateByCampaign(string collection, string campaignId, string id, JsonPatchDocument patch);
        Task<int> DeleteByCampaign(string collectionId, string campaignId, string id);
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MythicTable.Campaign.Data;
using MythicTable.Collections.Providers;
using MythicTable.Common.Controllers;
using MythicTable.Profile.Data;
using MythicTable.Filters;
using Newtonsoft.Json.Linq;

namespace MythicTable.Collections.Controller
{
    [Route("api/collections")]
    [ApiController]
    [Authorize]
    public class CollectionsController : AuthorizedController
    {
        private readonly ICollectionProvider provider;
        private readonly ICampaignProvider campaignProvider;

        public CollectionsController(ICollectionProvider provider, ICampaignProvider campaignProvider, IProfileProvider profileProvider, IMemoryCache cache) : base(profileProvider, cache)
        {
            this.provider = provider;
            this.campaignProvider = campaignProvider;
        }

        [HttpGet("{collection}")]
        public async Task<List<JObject>> GetList(string collection)
        {
            return await provider.GetList(await this.GetProfileId(), collection);
        }

        [HttpPost("{collection}")]
        public async Task<JObject> Post(string collection, JObject jObject)
        {
            return await provider.Create(await this.GetProfileId(), collection, jObject);
        }

        [HttpPut("{collection}/id/{id}")]
        public async Task<JObject> Put(string collection, string id, JsonPatchDocument patch)
        {
            if(await provider.Update(await this.GetProfileId(), collection, id, patch) > 0)
            {
                return await provider.Get(await this.GetProfileId(), collection, id);
            }
            return null;
        }

        [HttpDelete("{collection}/id/{id}")]
        public async Task<JObject> Delete(string collection, string id)
        {
            return new JObject
            {
                {"numberDeleted", await provider.Delete(await this.GetProfileId(), collection, id) }
            };
        }

        [HttpGet("{collection}/campaign/{campaignId}")]
        [UserIsMemberOfCampaign("campaignId")]
        public async Task<List<JObject>> GetList(string collection, string campaignId)
        {
            await this.campaignProvider.Get(campaignId);
            return await provider.GetListByCampaign(collection, campaignId);
        }


        [HttpPost("{collection}/campaign/{campaignId}")]
        [UserIsMemberOfCampaign("campaignId")]
        public async Task<JObject> Post(string collection, string campaignId, JObject jObject)
        {
            await this.campaignProvider.Get(campaignId);
            return await provider.CreateByCampaign(await this.GetProfileId(), collection, campaignId, jObject);
        }

        [HttpDelete("{collection}/campaign/{campaignId}/id/{id}")]
        [UserIsMemberOfCampaign("campaignId")]
        public async Task<JObject> DeleteByCampaign(string collection, string campaignId, string id)
        {
            return new JObject
            {
                {"numberDeleted", await provider.DeleteByCampaign(collection, campaignId, id) }
            };
        }
    }
}

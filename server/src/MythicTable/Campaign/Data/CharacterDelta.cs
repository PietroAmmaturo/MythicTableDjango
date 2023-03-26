using System.Collections.Generic;
using Microsoft.AspNetCore.JsonPatch;
using Newtonsoft.Json;

namespace MythicTable.Campaign.Data
{
    public class CharacterDelta
    {
        [JsonProperty("campaignId")]
        public string CampaignId { get; set; }

        [JsonProperty("entities")]
        public IEnumerable<EntityOperation> Entities { get; set; }
    }
    
    // TODO - This needs to be deleted
    public class SessionOpDelta
    {
        [JsonProperty("delta")]
        public IEnumerable<JsonPatchDocument> Operations { get; set; }
    }

    public struct EntityOperation
    {
        [JsonProperty("id")]
        public string EntityId { get; set; }

        [JsonProperty("patch")]
        public JsonPatchDocument Patch { get; set; }

        public EntityOperation(string entityId, JsonPatchDocument patch)
        {
            this.EntityId = entityId;
            this.Patch = patch;
        }
    }
}

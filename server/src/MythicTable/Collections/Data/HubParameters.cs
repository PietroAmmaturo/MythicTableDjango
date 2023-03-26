using Microsoft.AspNetCore.JsonPatch;
using Newtonsoft.Json;

namespace MythicTable.Collections.Data
{
    public class UpdateCollectionHubParameters
    {
        [JsonProperty("collection")]
        public string Collection { get; set; }
        
        [JsonProperty("campaignId")]
        public string CampaignId { get; set; }

        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("patch")]
        public JsonPatchDocument Patch { get; set; }
    }
}

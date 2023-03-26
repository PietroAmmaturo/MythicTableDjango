using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MythicTable.Campaign.Data
{
    public class CampaignDTO
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]     
        public string Id { get; set; }
        public string JoinId { get; set; }
        public string Owner { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastModified { get; set; }

        public List<PlayerDTO> Players { get; set; } = new List<PlayerDTO>();

        public bool TutorialCampaign {get; set;} = false;
    }
}

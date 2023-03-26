using System.Collections.Generic;

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MythicTable.Profile.Data
{
    public class ProfileDto
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]    
        public string Id { get; set; }

        public string UserId { get; set; }
        public string DisplayName { get; set; }
        public string ImageUrl { get; set; }
        public bool HasSeenFPSplash {get; set;} = false;
        public bool HasSeenKSSplash {get; set;} = false;

        public List<string> Groups {get; set;}
    }
}
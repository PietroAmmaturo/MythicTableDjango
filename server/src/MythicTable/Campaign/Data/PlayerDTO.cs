using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MythicTable.Campaign.Data
{
    public class PlayerDTO
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]    
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
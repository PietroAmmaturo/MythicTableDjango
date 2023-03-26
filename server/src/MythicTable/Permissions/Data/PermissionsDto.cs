using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MythicTable.Permissions.Data
{
    public class PermissionsDto
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public bool IsPublic { get; set; }
        public List<string> Permitted { get; set; } = new List<string>();
        public string Campaign { get; set; }
        public string Object { get; set; }
    }
}

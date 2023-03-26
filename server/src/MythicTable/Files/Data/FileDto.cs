using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace MythicTable.Files.Data
{
    public class FileDto
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonProperty("id")]
        public string Id { get; set; }

        [BsonElement("reference")]
        [JsonIgnore()]
        public string Reference { get; set; }

        [BsonElement("path")]
        [JsonProperty("path")]
        public string Path { get; set; }

        [BsonElement("name")]
        [JsonProperty("name")]
        public string Name { get; set; }

        [BsonElement("user")]
        [JsonProperty("user")]
        public string User { get; set; }

        [BsonElement("url")]
        [JsonProperty("url")]
        public string Url { get; set; }

        [BsonElement("md5")]
        [JsonProperty("md5")]
        public string Md5 { get; set; }
    }
}

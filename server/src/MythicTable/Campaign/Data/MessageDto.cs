using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MythicTable.TextParsing;

namespace MythicTable.Campaign.Data
{
    public class MessageDto
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [JsonProperty("timestamp")]
        public double Timestamp { get; set; }

        [JsonProperty("userId")]
        public string UserId { get; set; }

        [JsonProperty("displayName")]
        public string DisplayName { get; set; }

        [JsonProperty("sessionId")]
        public string SessionId { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        public ChatDto Result { get; set; }

        public string ClientId { get; set; }

        public Dictionary<string, object> Context { get; set; }

        public override bool Equals(object other)
        {
            if(other.GetType() != GetType())
            {
                return false;
            }
            return Message == ((MessageDto) other).Message;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, Timestamp, UserId, DisplayName, SessionId, Message, Result);
        }
    }
}

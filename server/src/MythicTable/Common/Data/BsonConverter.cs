using System;
using MongoDB.Bson;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MythicTable.Common.Data
{
    public class BsonConverter : JsonConverter<BsonDocument>
    {
        public override void WriteJson(JsonWriter writer, BsonDocument doc, JsonSerializer serializer)
        {
            writer.WriteStartObject();
            foreach (var element in doc.Elements)
            {
                writer.WritePropertyName(element.Name);
                if (element.Value is BsonNull)
                {
                    writer.WriteNull();
                }
                else if (element.Value.IsBsonDocument)
                {
                    WriteJson(writer, element.Value.AsBsonDocument, serializer);
                }
                else
                {
                    writer.WriteValue(element.Value);
                }
            }
            writer.WriteEndObject();
        }

        public override BsonDocument ReadJson(JsonReader reader, Type objectType, BsonDocument existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            JObject jObject = JObject.Load(reader);
            return jObject.AsBson();
        }
    }
}

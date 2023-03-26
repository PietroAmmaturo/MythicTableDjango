using System.Dynamic;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.JsonPatch.Operations;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using Newtonsoft.Json.Linq;
using JsonConvert = Newtonsoft.Json.JsonConvert;

namespace MythicTable.Common.Data
{
    public static class BsonExtensions
    {
        public static JObject AsJson(this BsonDocument doc)
        {
            var jsonWriterSettings = new JsonWriterSettings { OutputMode = JsonOutputMode.Strict };
            var json = doc.ToJson<BsonDocument>(jsonWriterSettings);
            var obj = JObject.Parse(json);
            if (obj.ContainsKey("_id"))
            {
                if (obj["_id"]?.Type == JTokenType.Object)
                {
                    obj["_id"] = (obj["_id"] as JObject)?["$oid"];
                }
            }
            return obj;
        }

        public static ExpandoObject AsExpandoObject(this BsonDocument doc)
        {
            string json = doc.ToJson();
            if(json == "{}" || json == "[]")
            {
                return new ExpandoObject();
            }
            return JsonConvert.DeserializeObject<ExpandoObject>(json);
        }

        public static BsonDocument AsBson(this JObject json)
        {
            return BsonDocument.Parse(json.ToString());
        }

        public static BsonDocument AsBson(dynamic obj)
        {
            return BsonDocument.Parse(JsonConvert.SerializeObject(obj));
        }

        public static BsonDocument Patch(this BsonDocument doc, JsonPatchDocument patch)
        {
            var obj = doc.AsExpandoObject();
            patch.ApplyTo(obj);
            return AsBson(obj);
        }

        public static BsonDocument Patch(this BsonDocument doc, Operation operation)
        {
            var obj = doc.AsExpandoObject();
            var patch = new JsonPatchDocument();
            patch.Operations.Add(operation);
            patch.ApplyTo(obj);
            return AsBson(obj);
        }
    }
}

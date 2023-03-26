using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using MongoDB.Bson;
using MythicTable.Common.Data;
using Newtonsoft.Json.Linq;

namespace MythicTable.Common.JsonPatch
{
    public class JsonPatchTranslator
    {
        public string JsonPath2MongoPath(string path)
        {
            var newPath = path.Substring(1);
            newPath = newPath.Replace("/", ".");
            newPath = new Regex("\\.$").Replace(newPath, "", 1);
            return newPath;
        }

        public string JsonPath2MongoCharacterPath(string path)
        {
            string newPath = path.Substring(1);

            foreach (var root in new List<string>{ "Token", "Attributes", "Asset" })
            {
                newPath = new Regex("^" + root.ToLower()).Replace(newPath, root, 1);
            }
            newPath = newPath.Replace("/", ".");
            newPath = new Regex("\\.$").Replace(newPath, "", 1);
            return "Characters.$." + newPath;
        }
        
        public string JsonPath2MongoArrayName(string path)
        {
            var formattedPath = JsonPath2MongoPath(path);
            return formattedPath.Remove(formattedPath.LastIndexOf('.'));
        }
        public bool PathIsArray(string path)
        {
            int output;
            var pathArr = path.Split('/');
            return int.TryParse(pathArr[pathArr.Length - 1], out output);
        }

        public BsonValue Json2Mongo(object json)
        {
            json = json switch
            {
                null => throw new ArgumentException($"Json2Mongo unexpected type: null"),
                JValue jValue => jValue.Value,
                _ => json
            };

            switch (json)
            {
                case string s:
                    return new BsonString(s);
                case int i:
                    return new BsonInt32(i);
                case long l:
                    return new BsonInt64(l);
                case float f:
                    return new BsonDouble(f);
                case double d:
                    return new BsonDouble(d);
                case bool b:
                    return new BsonBoolean(b);
                case JObject jObject:
                    return jObject.AsBson();
                case JArray array:
                    return new BsonArray(array.ToObject<List<object>>());
                default:
                    throw new ArgumentException($"Json2Mongo unexpected type: {json.GetType()}");
            }
        }
    }
}
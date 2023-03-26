using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.JsonPatch.Operations;
using MongoDB.Bson;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Dynamic;
using MythicTable.Common.Data;
using Xunit;

namespace MythicTable.Tests.Util.JsonPatch
{
    public class JsonPatchTests
    {
        [Fact]
        public void TestJObject()
        {
            var json = new JObject
            {
                {"test", 5}
            };
            var patch = new JsonPatchDocument();
            patch.Replace("/test", 6);

            dynamic obj = JsonConvert.DeserializeObject<ExpandoObject>(json.ToString());
            patch.ApplyTo(obj);
            json = JObject.Parse(JsonConvert.SerializeObject(obj));

            Assert.Equal(6, (int)json["test"]);
        }

        [Fact]
        public void TestBson()
        {
            var bson = new BsonDocument
            {
                {"test", 5}
            };
            var patch = new JsonPatchDocument();
            patch.Replace("/test", 6);
            var newBson = bson.Patch(patch);
            Assert.Equal(6, (int)newBson["test"]);
        }

        [Fact]
        public void TestBsonByOperation()
        {
            var bson = new BsonDocument
            {
                {"test", 5}
            };
            var patch = new JsonPatchDocument();
            patch.Replace("/test", 6);
            var newBson = bson.Patch(patch.Operations[0]);
            Assert.Equal(6, (int)newBson["test"]);
        }
    }
}
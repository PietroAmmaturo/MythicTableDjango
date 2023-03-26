using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using System.Dynamic;
using MythicTable.Common.Data;
using Xunit;

namespace MythicTable.Tests.Util.JsonPatch
{
    public class BsonExtensionsTests
    {
        [Fact]
        public void TestAsJson()
        {
            var bson = new BsonDocument
            {
                {"test", 5}
            };
            var json = bson.AsJson();
            Assert.Equal(5, (int)json["test"]);
        }

        [Fact]
        public void TestAsJsonWithStrings()
        {
            var bson = new BsonDocument
            {
                {"test", "shoes"}
            };
            var json = bson.AsJson();
            Assert.Equal("shoes", (string)json["test"]);
        }

        [Fact]
        public void TestAsJsonRecursive()
        {
            var bson = new BsonDocument
            {
                {"test", 5},
                {"foo", new BsonDocument
                    {
                        {"bar", 6}
                    }
                }
            };
            var json = bson.AsJson();
            Assert.Equal(5, (int)json["test"]);
            Assert.Equal(6, (int)json["foo"]?["bar"]);
        }

        [Fact]
        public void TestAsJsonWithOid()
        {
            var bson = new BsonDocument
            {
                {"_id", ObjectId.Parse("000000000000000000000000")},
                {"test", 5}
            };
            var json = bson.AsJson();
            Assert.Equal("000000000000000000000000", json["_id"]);
            Assert.Equal(5, (int)json["test"]);
        }

        [Fact]
        public void TestAsBson()
        {
            var json = new JObject
            {
                {"test", 5},
                {"foo", new JObject
                    {
                        {"bar", 6}
                    }
                }
            };
            var bson = json.AsBson();
            Assert.Equal(5, (int)bson["test"]);
            Assert.Equal(6, (int)bson["foo"]["bar"]);
        }

        [Fact]
        public void TestAsExpando()
        {
            var bson = new BsonDocument
            {
                {"test", 5}
            };
            dynamic obj = bson.AsExpandoObject();
            Assert.Equal(5, obj.test);
        }

        [Fact]
        public void TestEmptyBsonAsExpando()
        {
            var bson = new BsonDocument();
            Assert.NotNull(bson.AsExpandoObject());
        }

        [Fact]
        public void TestFromExpando()
        {
            dynamic obj = new ExpandoObject();
            obj.test = 5;
            obj.foo = new ExpandoObject();
            obj.foo.bar = 6;
            var bson = BsonExtensions.AsBson(obj);
            Assert.Equal(5, (int)bson["test"]);
            Assert.Equal(6, (int)bson["foo"]["bar"]);
        }
    }
}

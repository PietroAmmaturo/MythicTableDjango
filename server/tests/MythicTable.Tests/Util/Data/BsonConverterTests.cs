using MongoDB.Bson;
using MythicTable.Campaign.Util;
using MythicTable.Common.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Tests.Util.Data
{
    public class BsonConverterTests
    {
        [Fact]
        public void TestBasicConversion()
        {
            var bson = new BsonDocument
            {
                {"test", 5}
            };
            string str = JsonConvert.SerializeObject(bson, Formatting.None, new BsonConverter());
            Assert.Equal("{\"test\":5}", str);
        }

        [Fact]
        public void TestConvertsNull()
        {
            var bson = new BsonDocument
            {
                {"test", BsonNull.Value}
            };
            string str = JsonConvert.SerializeObject(bson, Formatting.None, new BsonConverter());
            Assert.Equal("{\"test\":null}", str);
        }

        [Fact]
        public void TestRecursion()
        {
            var bson = new BsonDocument
            {
                {"test", new BsonDocument
                    {
                        {"foo", "bar"}
                    }}
            };
            string str = JsonConvert.SerializeObject(bson, Formatting.None, new BsonConverter());
            Assert.Equal("{\"test\":{\"foo\":\"bar\"}}", str);
        }

        [Fact]
        public void TestBizarreRecursionBug()
        {
            var bson = new BsonDocument
            {
                { "color", BsonNull.Value },
                { "asset", "." }
            };
            string str = JsonConvert.SerializeObject(bson, Formatting.None, new BsonConverter());
            var json = JObject.Parse(str);
            Assert.Equal(".", json["asset"]);
        }

        [Fact]
        public void TestDeserialization()
        {
            var bson = new BsonDocument
            {
                { "color", BsonNull.Value },
                { "asset", "." }
            };
            string str = JsonConvert.SerializeObject(bson, Formatting.None, new BsonConverter());
            var newBson = JsonConvert.DeserializeObject<BsonDocument>(str, new BsonConverter());
            Assert.Equal(".", newBson["asset"]);
        }
    }
}

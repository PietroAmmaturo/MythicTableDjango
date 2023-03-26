using System;
using MongoDB.Bson;
using MythicTable.Common.JsonPatch;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using Xunit;

namespace MythicTable.Tests.Util.JsonPatch
{
    public class JsonPatchTranslatorTests
    {
        private readonly JsonPatchTranslator translator;

        public JsonPatchTranslatorTests()
        {
            translator = new JsonPatchTranslator();
        }

        [Fact]
        public void TestJsonPath2MongoPath()
        {
            var mongoPath = translator.JsonPath2MongoPath("/foo/bar");
            Assert.Equal("foo.bar", mongoPath);
        }

        [Fact]
        public void TestJsonPath2MongoPathForTokens()
        {
            var mongoPath = translator.JsonPath2MongoCharacterPath("/token/pos");
            Assert.Equal("Characters.$.Token.pos", mongoPath);
        }

        [Fact]
        public void TestJsonPath2MongoPathHandlesTrailingSlash()
        {
            var mongoPath = translator.JsonPath2MongoCharacterPath("/token/pos/");
            Assert.Equal("Characters.$.Token.pos", mongoPath);
        }

        [Fact]
        public void TestJsonPath2MongoPathForAttributes()
        {
            var mongoPath = translator.JsonPath2MongoCharacterPath("/attributes.description");
            Assert.Equal("Characters.$.Attributes.description", mongoPath);
        }

        [Fact]
        public void TestJsonPath2MongoPathHandlesKeywordsInPath()
        {
            var mongoPath = translator.JsonPath2MongoCharacterPath("/token/pos/token");
            Assert.Equal("Characters.$.Token.pos.token", mongoPath);
            mongoPath = translator.JsonPath2MongoCharacterPath("/token/pos/attributes");
            Assert.Equal("Characters.$.Token.pos.attributes", mongoPath);
        }

        [Fact]
        public void TestJsonPath2MongoPathForAssets()
        {
            var mongoPath = translator.JsonPath2MongoCharacterPath("/asset/src");
            Assert.Equal("Characters.$.Asset.src", mongoPath);
        }

        [Fact]
        public void TestJObjectToBson()
        {
            var value = translator.Json2Mongo(new JObject { { "q", 5 }, { "r", 6 } });
            Assert.Equal(new BsonDocument { { "q", 5 }, { "r", 6 } }, value);
        }

        [Fact]
        public void TestJsonValueToBson()
        {
            var value = translator.Json2Mongo(new JValue("string"));
            Assert.IsType<BsonString>(value);
            Assert.Equal(new BsonString("string"), value);
        }

        [Fact]
        public void TestJsonArrayToList()
        {
            var value = translator.Json2Mongo(new JArray(new List<string> { "foo", "bar" }));
            Assert.Equal(new BsonArray { "foo", "bar" }, value);
        }

        [Fact]
        public void ShouldTranslateIntegers()
        {
            var value = translator.Json2Mongo(24);
            Assert.Equal(new BsonInt32(24), value);
        }

        [Fact]
        public void ShouldTranslateLongIntegers()
        {
            var value = translator.Json2Mongo(24L);
            Assert.Equal(new BsonInt64(24), value);
        }

        [Fact]
        public void ShouldTranslateStrings()
        {
            var value = translator.Json2Mongo("text");
            Assert.Equal(new BsonString("text"), value);
        }

        [Fact]
        public void ShouldTranslateFloats()
        {
            var value = translator.Json2Mongo(24.0f);
            Assert.Equal(new BsonDouble(24.0), value);
        }

        [Fact]
        public void ShouldTranslateDoubles()
        {
            var value = translator.Json2Mongo(24.0);
            Assert.Equal(new BsonDouble(24.0), value);
        }

        [Fact]
        public void ShouldTranslateBooleans()
        {
            var value = translator.Json2Mongo(true);
            Assert.Equal(new BsonBoolean(true), value);
        }

        [Fact]
        public void ShouldThrowExceptionsNullTypes()
        {
            var exception = Assert.Throws<ArgumentException>(() => translator.Json2Mongo(null));
            Assert.Equal("Json2Mongo unexpected type: null", exception.Message);
        }

        [Fact]
        public void ShouldThrowExceptionsForUnknownTypes()
        {
            var exception = Assert.Throws<ArgumentException>(() => translator.Json2Mongo(new Exception()));
            Assert.Equal("Json2Mongo unexpected type: System.Exception", exception.Message);
        }

        [Fact]
        public void IsArrayReturnsTrueWhenTrailingIndex()
        {
            Assert.True(translator.PathIsArray("/foo/bar/0"));
        }
        [Fact]
        public void IsArrayHandlesNamesWithNumbersInThem()
        {
            Assert.False(translator.PathIsArray("/foo/bar12"));
            Assert.True(translator.PathIsArray("/foo/bar12/6"));
        }

        [Fact]
        public void ArrayNameReturnsThePathWithoutAnIndex()
        {
            Assert.Equal("foo.bar", translator.JsonPath2MongoArrayName("/foo/bar/6"));
        }
    }
}
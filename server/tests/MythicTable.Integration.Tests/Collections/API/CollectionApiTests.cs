using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.TestHost;
using MythicTable.Integration.Tests.Helpers;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Integration.Tests.Collections.API
{
    public class CollectionApiTests
    {
        private readonly HttpClient client;

        private string _baseUrl = "/api/collections";
        HttpRequestInfo _rqInfoDelete => new HttpRequestInfo() { Method = HttpMethod.Delete, Url = _baseUrl };
        HttpRequestInfo _rqInfoGet => new HttpRequestInfo() { Method = HttpMethod.Get, Url = _baseUrl };
        HttpRequestInfo _rqInfoPost => new HttpRequestInfo() { Method = HttpMethod.Post, Url = _baseUrl };
        HttpRequestInfo _rqInfoPut => new HttpRequestInfo() { Method = HttpMethod.Put, Url = _baseUrl };

        public CollectionApiTests()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            client = server.CreateClient();
        }

        [Fact]
        public async Task GetCollectionReturnsEmpty()
        {
            //Arrange
            await ProfileTestUtil.Login(client);
            var rqInfo = _rqInfoGet;
            rqInfo.Url += "/test";

            //Act
            using var response = await client.MakeRequest(rqInfo);

            //Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            var jObjects = JsonConvert.DeserializeObject<List<JObject>>(json);
            Assert.Empty(jObjects);
        }

        [Fact]
        public async Task PostAndGetReturnsJObjects()
        {
            await ProfileTestUtil.Login(client);

            var o = new JObject
            {
                { "Name", "Integration Test JObject" }
            };
            var collection = "test";

            await CreateObjectInCollection(collection, o);

            List<JObject> jObjects = await GetCollection(collection);
            Assert.Single(jObjects);
            Assert.Equal("Integration Test JObject", jObjects[0]["Name"]);
        }

        [Fact]
        public async Task UpdateChangesJObjects()
        {
            await ProfileTestUtil.Login(client);

            var o = new JObject
            {
                { "Name", "Integration Test JObject" }
            };
            const string collection = "test";

            var jObject = await CreateObjectInCollection(collection, o);

            var patch = new JsonPatchDocument()
                            .Replace("Name", "Update Test JObject")
                            .Add("foo", "bar");
            jObject = await UpdateObjectInCollection(collection, patch, jObject["_id"]?.ToString());

            Assert.Equal("Update Test JObject", jObject["Name"]);
            Assert.Equal("bar", jObject["foo"]);
        }

        [Fact]
        public async Task DeleteApi()
        {
            await ProfileTestUtil.Login(client);

            var collection = "test";
            var jObject = await CreateObjectInCollection(collection, new JObject());

            await DeleteObjectInCollection(collection, jObject["_id"]?.ToString());

            List<JObject> jObjects = await GetCollection(collection);
            Assert.Empty(jObjects);
        }

        private async Task<JObject> CreateObjectInCollection(string collection, JObject o)
        {
            var _rqInfo = _rqInfoPost;
            _rqInfo.Url += $"/{collection}";
            _rqInfo.Content = o;

            using var response = await client.MakeRequest(_rqInfo);
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<JObject>(json);
        }

        private async Task<List<JObject>> GetCollection(string collection)
        {
            var rqInfo = _rqInfoGet;
            rqInfo.Url += $"/{collection}";

            using var response = await client.MakeRequest(rqInfo);

            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<JObject>>(json);
        }

        private async Task<JObject> UpdateObjectInCollection(string collection, JsonPatchDocument patch, string id)
        {
            var rqInfo = _rqInfoPut;
            rqInfo.Url += $"/{collection}/id/{id}";
            rqInfo.Content = patch;

            using var response = await client.MakeRequest(rqInfo);

            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<JObject>(json);
        }

        private async Task DeleteObjectInCollection(string collection, string id)
        {
            var rqInfo = _rqInfoDelete;
            rqInfo.Url += $"/{collection}/id/{id}";

            using var response = await client.MakeRequest(rqInfo);

            response.EnsureSuccessStatusCode();
        }
    }
}

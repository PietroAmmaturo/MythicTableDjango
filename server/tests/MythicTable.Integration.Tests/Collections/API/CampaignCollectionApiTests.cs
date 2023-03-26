using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using MythicTable.Campaign.Data;
using MythicTable.Integration.Tests.Helpers;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Integration.Tests.Collections.API
{
    public class CampaignCollectionApiTests
    {
        private readonly HttpClient client;
        private readonly TestServer server;
        private const string COLLECTION_NAME = "collection_1";
        private const string CAMPAIGN_ID = "4dad901291c2949e7a5b6aa8";

        string _baseUrl = "/api/collections";
        HttpRequestInfo _rqInfoDelete => new HttpRequestInfo() { Method = HttpMethod.Delete, Url = _baseUrl };
        HttpRequestInfo _rqInfoGet => new HttpRequestInfo() { Method = HttpMethod.Get, Url = _baseUrl };
        HttpRequestInfo _rqInfoPost => new HttpRequestInfo() { Method = HttpMethod.Post, Url = _baseUrl };
        HttpRequestInfo _rqInfoPut => new HttpRequestInfo() { Method = HttpMethod.Put, Url = _baseUrl };

        public CampaignCollectionApiTests()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            server = new TestServer(builder);
            client = server.CreateClient();
        }

        [Fact]
        public async Task RequiresCampaign()
        {
            //Arrange
            var rqInfo = _rqInfoGet;
            rqInfo.Url += $"/{COLLECTION_NAME}/campaign/{CAMPAIGN_ID}";

            //Act
            using var response = await client.MakeRequest(rqInfo);

            //Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetCollectionReturnsEmpty()
        {
            await ProfileTestUtil.Login(client);

            var campaign = await CreateCampaign(new CampaignDTO());

            List<JObject> jObjects = await GetCollection(campaign);
            Assert.Empty(jObjects);
        }

        [Fact]
        public async Task CollectionsAreCampaignSpecific()
        {
            await ProfileTestUtil.Login(client);

            var campaign1 = await CreateCampaign(new CampaignDTO());
            var campaign2 = await CreateCampaign(new CampaignDTO());

            await CreateCampaignObject(campaign1, new JObject());

            Assert.Single(await GetCollection(campaign1));
            Assert.Empty(await GetCollection(campaign2));
        }

        [Fact]
        public async Task CampaignCollectionsAreNotUserSpecific()
        {
            await ProfileTestUtil.Login(client);

            var campaign = await CreateCampaign(new CampaignDTO());
            await server.CreateUser("fake-user-02");
            await AddPlayer(campaign, "fake-user-02");
            
            await CreateCampaignObject(campaign, new JObject());

            Assert.Single(await GetCollection(campaign));

            var request = server.CreateRequest($"{_baseUrl}/{COLLECTION_NAME}/campaign/{campaign.Id}");
            request.AddHeader(TestStartup.FAKE_USER_ID_HEADER, "fake-user-02");
            var response = await request.GetAsync();
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            var collections = JsonConvert.DeserializeObject<List<JObject>>(json);

            Assert.Single(collections);
        }

        private async Task<CampaignDTO> CreateCampaign(CampaignDTO campaign)
        {
            var rqInfo = _rqInfoPost;
            rqInfo.Url = "/api/campaigns";
            rqInfo.Content = campaign;

            using var response = await client.MakeRequest(rqInfo);

            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<CampaignDTO>(json);
        }

        private async Task<List<JObject>> GetCollection(CampaignDTO campaign)
        {
            var rqInfo = _rqInfoGet;
            rqInfo.Url += $"/{COLLECTION_NAME}/campaign/{campaign.Id}";

            using var response = await client.MakeRequest(rqInfo);
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<JObject>>(json);
        }

        private async Task<JObject> CreateCampaignObject(CampaignDTO campaign, JObject jObject)
        {
            var rqInfo = _rqInfoPost;
            rqInfo.Url += $"/{COLLECTION_NAME}/campaign/{campaign.Id}";
            rqInfo.Content = jObject;

            using var response = await client.MakeRequest(rqInfo);
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<JObject>(json);
        }

        private async Task<CampaignDTO> AddPlayer(CampaignDTO campaign, string userId, string userName="test@user.me")
        {
            var request = server.CreateRequest($"/api/campaigns/join/{campaign.JoinId}");
            request.AddHeader(TestStartup.FAKE_USER_ID_HEADER, userId);
            request.AddHeader(TestStartup.FAKE_USER_NAME_HEADER, userName);
            using var response = await request.SendAsync("PUT");
            response.EnsureSuccessStatusCode();

            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<CampaignDTO>(json);
        }
    }
}

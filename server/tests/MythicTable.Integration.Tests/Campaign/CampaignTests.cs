using System.Threading.Tasks;
using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using MythicTable.Campaign.Data;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json;
using Xunit;
using System.Net.Http;
using MythicTable.Integration.Tests.Helpers;

namespace MythicTable.Integration.Tests.Campaign
{
    public class CampaignTests
    {
        string _baseUrl = "/api/campaigns";
        HttpRequestInfo _rqInfoDelete => new HttpRequestInfo() { Method = HttpMethod.Delete, Url = _baseUrl };
        HttpRequestInfo _rqInfoGet => new HttpRequestInfo() { Method = HttpMethod.Get, Url = _baseUrl };
        HttpRequestInfo _rqInfoPost => new HttpRequestInfo() { Method = HttpMethod.Post, Url = _baseUrl };
        HttpRequestInfo _rqInfoPut => new HttpRequestInfo() { Method = HttpMethod.Put, Url = _baseUrl };

        [Fact]
        public async Task CreateCampaignTest()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            var client = server.CreateClient();

            await ProfileTestUtil.Login(client);

            var campaign = new CampaignDTO()
            {
                Name = "Integration Test Campaign"
            };

            using var response = await client.MakeRequest(new HttpRequestInfo() 
            { 
                Method = HttpMethod.Post,
                Url="/api/campaigns", 
                Content = campaign 
            });
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            var newCampaign = JsonConvert.DeserializeObject<CampaignDTO>(json);
            Assert.Equal("Integration Test Campaign", newCampaign.Name);
        }

        [Fact]
        public async Task AuthorizedCampaignDeleteTest() 
        {
            //Arrange
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            var client = server.CreateClient();

            await ProfileTestUtil.Login(client);

            var campaign = new CampaignDTO() { Name = "Integration Test Campaign" };

            var rqInfo = _rqInfoPost;
            rqInfo.Content = campaign;

            //Act
            using var response = await client.MakeRequest(rqInfo);

            //Assert
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var campaignObject = JsonConvert.DeserializeObject<CampaignDTO>(json);

            rqInfo = _rqInfoDelete;
            rqInfo.Url += $"/{campaignObject.Id}";
            using var deleteResponse = await client.MakeRequest(rqInfo);
            deleteResponse.EnsureSuccessStatusCode();

            rqInfo.Method = HttpMethod.Get;
            using var getResponse = await client.MakeRequest(rqInfo);
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }
    }
}
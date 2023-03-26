using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using MythicTable.Campaign.Data;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json;
using Xunit;
using MythicTable.Integration.Tests.Helpers;

namespace MythicTable.Integration.Tests.Campaign
{
    public class MultiUserCampaignTests
    {
        string _baseUrl = "/api/campaigns";
        HttpRequestInfo _rqInfoPost => new HttpRequestInfo() { Method = HttpMethod.Post, Url = _baseUrl };

        [Fact]
        public async Task UnauthorizedCampaignDeleteReturns401()
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

            var res = await server.CreateUser("fake-user-02");
            res.EnsureSuccessStatusCode();

            var request = server.CreateRequest($"{_baseUrl}/{campaignObject.Id}");
            request.AddHeader(TestStartup.FAKE_USER_ID_HEADER, "fake-user-02");

            using var deleteResponse = await request.SendAsync("DELETE");
            Assert.Equal(HttpStatusCode.Unauthorized, deleteResponse.StatusCode);
        }

        [Fact]
        public async Task UnauthorizedCampaignUpdateReturns401()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            var client = server.CreateClient();
            
            await ProfileTestUtil.Login(client);

            var campaign = new CampaignDTO()
            {
                Name = "Integration Test Campaign"
            };
            
            using var campaignResponse = await client.MakeRequest(new HttpRequestInfo{
                Method = HttpMethod.Post,
                Url = "/api/campaigns",
                Content = campaign,
            });
            campaignResponse.EnsureSuccessStatusCode();

            var json = await campaignResponse.Content.ReadAsStringAsync();
            campaign = JsonConvert.DeserializeObject<CampaignDTO>(json);

            var updatedCampaign = new CampaignDTO()
            {
                Name = "Failed Integration Test"
            };
            client.DefaultRequestHeaders.Add(TestStartup.FAKE_USER_ID_HEADER, "fake-user-02");
            using var profileCreate = await client.MakeRequest(new HttpRequestInfo{
                Method = HttpMethod.Get,
                Url = "/api/profiles/me"
            });
            profileCreate.EnsureSuccessStatusCode();
            using var unauthResponse = await client.MakeRequest(new HttpRequestInfo{
                Method = HttpMethod.Put,
                Url = $"/api/campaigns/{campaign.Id}",  
                Content = updatedCampaign
            });
            Assert.Equal(HttpStatusCode.Unauthorized, unauthResponse.StatusCode);
        }
    }
}
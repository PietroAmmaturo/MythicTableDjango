using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MythicTable.Campaign.Data;
using MythicTable.Integration.Tests.Helpers;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json;
using Xunit;

namespace MythicTable.Integration.Tests.Campaign
{
    public class CampaignAuthenticationTests : IClassFixture<WebApplicationFactory<MythicTable.Startup>>
    {
        private readonly WebApplicationFactory<MythicTable.Startup> _factory;

        string _baseUrl = "/api/campaigns";
        HttpRequestInfo _rqInfoDelete => new HttpRequestInfo() { Method = HttpMethod.Delete, Url = _baseUrl };
        HttpRequestInfo _rqInfoGet => new HttpRequestInfo() { Method = HttpMethod.Get, Url = _baseUrl };
        HttpRequestInfo _rqInfoPost => new HttpRequestInfo() { Method = HttpMethod.Post, Url = _baseUrl };
        HttpRequestInfo _rqInfoPut => new HttpRequestInfo() { Method = HttpMethod.Put, Url = _baseUrl };

        public CampaignAuthenticationTests(WebApplicationFactory<MythicTable.Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task CreateCampaignRequiresAuthenticationTest()
        {
            //Arrange
            var client = _factory.CreateClient();
            var campaign = new CampaignDTO() { Name = "Integration Test Campaign" };
            
            var rqInfo = _rqInfoPost;
            rqInfo.Content = campaign;

            //Act
            using var response = await client.MakeRequest(rqInfo);

            //Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MythicTable.Integration.Tests.Helpers;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.Profile.Data;
using Xunit;

namespace MythicTable.Integration.Tests.Profile.API
{
    public class ProfileAuthenticationTests : IClassFixture<WebApplicationFactory<MythicTable.Startup>>
    {
        private readonly WebApplicationFactory<MythicTable.Startup> _factory;

        string _baseUrl = "/api/profiles";
        HttpRequestInfo _rqInfoGet => new HttpRequestInfo() { Method = HttpMethod.Get, Url = _baseUrl };
        HttpRequestInfo _rqInfoPut => new HttpRequestInfo() { Method = HttpMethod.Put, Url = _baseUrl };

        public ProfileAuthenticationTests(WebApplicationFactory<MythicTable.Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GetDoesNotRequireAuth()
        {
            //Arrange
            var client = _factory.CreateClient();
            var rqInfo = _rqInfoGet;
            rqInfo.Url += "/4dad901291c2949e7a5b6aa8";

            //Act
            using var response = await client.MakeRequest(rqInfo);


            //Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetManyDoesNotRequireAuth()
        {
            //Arrange
            var client = _factory.CreateClient();
            var rqInfo = _rqInfoGet;
            rqInfo.Url += "?userId=4dad901291c2949e7a5b6aa8&userId=4dad901291c2949e7a5b6aa8";

            //Act
            using var response = await client.MakeRequest(rqInfo);

            //Assert
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task GetMeRequiresAuth()
        {
            //Arrange
            var client = _factory.CreateClient();
            var rqInfo = _rqInfoGet;
            rqInfo.Url += "/me";

            //Act
            using var response = await client.MakeRequest(rqInfo);

            //Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task PutRequiresAuth()
        {
            //Arrange
            var client = _factory.CreateClient();
            var rqInfo = _rqInfoPut;
            rqInfo.Content = new ProfileDto();

            //Act
            using var response = await client.MakeRequest(rqInfo);

            //Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
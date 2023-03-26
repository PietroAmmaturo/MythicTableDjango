using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.Permissions.Data;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json;
using Xunit;

namespace MythicTable.Integration.Tests.Permissions
{
    public class PermissionsApiTests : IClassFixture<WebApplicationFactory<Startup>>
    {
        private readonly WebApplicationFactory<Startup> _factory;

        public PermissionsApiTests(WebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task RequiresAuthTest()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("api/permissions/campaign_id");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task ReturnsEmptyList()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            var client = server.CreateClient();

            await ProfileTestUtil.Login(client);

            var response = await client.GetAsync("api/permissions/campaign_id");

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<List<PermissionsDto>>(json);
            Assert.Equal(new List<PermissionsDto>(), result);
        }
    }
}
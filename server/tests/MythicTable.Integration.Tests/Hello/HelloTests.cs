using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.TestUtils.Profile.Util;
using Xunit;

namespace MythicTable.Integration.Tests.Hello
{
    public class HelloTests : IClassFixture<WebApplicationFactory<MythicTable.Startup>>
    {
        private readonly WebApplicationFactory<MythicTable.Startup> _factory;

        public HelloTests(WebApplicationFactory<MythicTable.Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task HelloTest()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("api/hello");

            response.EnsureSuccessStatusCode();
            Assert.Equal("text/plain; charset=utf-8",
                response.Content.Headers.ContentType.ToString());
        }

        [Fact]
        public async Task HelloMeRequiresAuthTest()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("api/hello/me");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task HelloMeReturnUsernameTest()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            var client = server.CreateClient();

            await ProfileTestUtil.Login(client);

            var response = await client.GetAsync("api/hello/me");

            response.EnsureSuccessStatusCode();
            Assert.Equal("text/plain; charset=utf-8",
                response.Content.Headers.ContentType.ToString());
            var result = await response.Content.ReadAsStringAsync();
            Assert.Equal("hello Test user", result);
        }
    }
}
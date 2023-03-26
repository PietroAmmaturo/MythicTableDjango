using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace MythicTable.Integration.Tests.Collections.API
{
    public class CollectionApiAuthTests : IClassFixture<WebApplicationFactory<MythicTable.Startup>>
    {
        private readonly WebApplicationFactory<MythicTable.Startup> _factory;

        public CollectionApiAuthTests(WebApplicationFactory<MythicTable.Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task RequiresAuthTest()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("api/collections/test");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
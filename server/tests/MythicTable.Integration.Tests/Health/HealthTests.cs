using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace MythicTable.Integration.Tests.Health
{
    public class HealthTests : IClassFixture<WebApplicationFactory<MythicTable.Startup>>
    {
        private readonly WebApplicationFactory<MythicTable.Startup> _factory;

        public HealthTests(WebApplicationFactory<MythicTable.Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task HealthTest()
        {
            var client = _factory.CreateClient();

            // ReSharper disable once StringLiteralTypo
            var response = await client.GetAsync("healthz");

            response.EnsureSuccessStatusCode();
        }
    }
}

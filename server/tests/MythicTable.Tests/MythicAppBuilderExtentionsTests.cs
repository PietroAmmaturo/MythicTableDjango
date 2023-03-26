using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace MythicTable.Tests
{
    public class MythicAppBuilderExtensionsTests
    {

        [Fact]
        public void ShouldDoStuffInDevelopment()
        {
            var app = new Moq.Mock<IApplicationBuilder>().Object;
            var env = new Moq.Mock<IWebHostEnvironment>().Object;
            var config = new Dictionary<string, string>
            {
                {"MTT_USE_GCP_IMAGE_STORE", "false"}
            };
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(config)
                .Build();
            
            app.UseLocalFileServer(env, configuration);
        }
    }
}

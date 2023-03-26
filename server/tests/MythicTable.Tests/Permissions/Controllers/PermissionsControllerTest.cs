using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using MythicTable.Controllers;
using MythicTable.Permissions.Data;
using MythicTable.Permissions.Providers;
using MythicTable.Profile.Data;
using Xunit;

namespace MythicTable.Tests.Permissions.Controllers
{
    public class PermissionsControllerTest : IAsyncLifetime
    {
        private PermissionsController controller;
        private Mock<IPermissionsProvider> providerMock;
        private string User { get; set; } = "Jon";
        private const string CampaignId = "012345678901234567890122";

        public Task InitializeAsync()
        {
            providerMock = new Mock<IPermissionsProvider>();
            controller = new PermissionsController(providerMock.Object, Mock.Of<IProfileProvider>(), Mock.Of<IMemoryCache>());

            var mockHttpContext = new Mock<HttpContext>();
            mockHttpContext.Setup(hc => hc.User.FindFirst(It.IsAny<string>()))
                            .Returns(() => new Claim("", User));
            controller.ControllerContext.HttpContext = mockHttpContext.Object;
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }

        [Fact]
        public async Task ReturnsEmptyListFromProvider()
        {
            providerMock.Setup(p => p.GetList(It.IsAny<string>()))
                .ReturnsAsync(new List<PermissionsDto>());
            
            var results = await controller.Get(CampaignId);
            
            Assert.Empty(results);
            providerMock.Verify(p => p.GetList(CampaignId));
        }

        [Fact]
        public async Task ReturnsListFromProvider()
        {
            providerMock.Setup(p => p.GetList(It.IsAny<string>()))
                .ReturnsAsync(new List<PermissionsDto>()
                {
                    new PermissionsDto(),
                });

            var results = await controller.Get(CampaignId);

            Assert.Single(results);
            providerMock.Verify(p => p.GetList(CampaignId));
        }
    }
}
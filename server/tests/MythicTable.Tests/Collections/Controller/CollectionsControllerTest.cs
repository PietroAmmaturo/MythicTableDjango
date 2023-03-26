using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using MythicTable.Campaign.Data;
using MythicTable.Collections.Controller;
using MythicTable.Profile.Data;
using MythicTable.Collections.Providers;
using MythicTable.TestUtils.Profile.Util;
using MythicTable.TestUtils.Util;
using Newtonsoft.Json.Linq;
using Xunit;


namespace MythicTable.Tests.Collections.Controller
{
    public class CollectionsControllerTest : IAsyncLifetime
    {
        private const string CollectionType = "TestCollection";

        private CollectionsController controller;
        private ICampaignProvider campaignProvider;

        private Mock<ICollectionProvider> collectionProviderMock;
        private Mock<IProfileProvider> profileProvider;

        private string User { get; } = "Jon";

        public Task InitializeAsync()
        {
            campaignProvider = Mock.Of<ICampaignProvider>();
            collectionProviderMock = new Mock<ICollectionProvider>();
            profileProvider = new Mock<IProfileProvider>();
            ProfileTestUtil.CreateProfile(profileProvider, User);
            controller = new CollectionsController(collectionProviderMock.Object, campaignProvider, profileProvider.Object, new MemoryCache(new MemoryCacheOptions()));

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
        public async Task Delete()
        {
            collectionProviderMock.Setup(p => p.Delete(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(1);
            var deleted = await controller.Delete(CollectionType, "test id");
            Assert.Equal(1, deleted["numberDeleted"]);
        }

        [Fact]
        public async Task DeleteByCampaign()
        {
            var campaign = campaignProvider.Create(new CampaignDTO(), controller.GetUserId());
            var player = campaignProvider.AddPlayer(campaign.Id.ToString(), new PlayerDTO());

            var deleted = await controller.DeleteByCampaign(CollectionType, campaign.Id.ToString(), player.Id.ToString());
            var playerExistsAfterDeletion = (int)deleted["numberDeleted"] > 0;

            Assert.False(playerExistsAfterDeletion);
        }
    }
}
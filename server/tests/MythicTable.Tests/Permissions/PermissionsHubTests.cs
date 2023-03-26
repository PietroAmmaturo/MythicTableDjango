using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using MythicTable.Campaign.Data;
using MythicTable.Collections.Data;
using MythicTable.Collections.Providers;
using MythicTable.Permissions.Data;
using MythicTable.Permissions.Exceptions;
using MythicTable.Permissions.Providers;
using MythicTable.Profile.Data;
using MythicTable.SignalR;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Tests.Permissions
{
    public class PermissionsHubTests
    {
        private readonly Mock<IHubCallerClients<ILiveClient>> clientsMock;
        private readonly Mock<ICollectionProvider> collectionProviderMock;
        private readonly Mock<ILiveClient> groupClientsMock;

        private readonly LivePlayHub hub;
        private readonly Mock<ILogger<LivePlayHub>> loggerMock;
        private readonly Mock<IPermissionsProvider> permissionsProvider;

        private string User { get; } = "test-user";
        private ProfileDto Profile { get; }

        public PermissionsHubTests()
        {
            var campaignProviderMock = new Mock<ICampaignProvider>();
            collectionProviderMock = new Mock<ICollectionProvider>();
            permissionsProvider = new Mock<IPermissionsProvider>();
            loggerMock = new Mock<ILogger<LivePlayHub>>();
            clientsMock = new Mock<IHubCallerClients<ILiveClient>>();
            groupClientsMock = new Mock<ILiveClient>();
            var profileProvider = new Mock<IProfileProvider>();


            clientsMock.Setup(m => m.Group(It.IsAny<string>())).Returns(groupClientsMock.Object);
            groupClientsMock
                .Setup(a => a.PermissionsUpdated(It.IsAny<PermissionsDto>()))
                .Returns(Task.CompletedTask);

            Profile = ProfileTestUtil.CreateProfile(profileProvider, User);

            campaignProviderMock
                .Setup(c => c.Get(It.IsAny<string>()))
                .Returns(Task.FromResult(new CampaignDTO() { Owner = Profile.Id }));

            hub = new LivePlayHub(campaignProviderMock.Object, collectionProviderMock.Object,
                permissionsProvider.Object, profileProvider.Object, new MemoryCache(new MemoryCacheOptions()),
                loggerMock.Object)
            {
                Clients = clientsMock.Object
            };

            var hubCallerContextMock = new Mock<HubCallerContext>();
            hubCallerContextMock.Setup(c => c.User.FindFirst(It.IsAny<string>()))
                .Returns(() => new Claim("", User));
            hub.Context = hubCallerContextMock.Object;
        }

        [Fact]
        public async Task PermissionsUpdateBroadcasts()
        {
            var campaignId = "test-session";
            var permissions = new PermissionsDto();

            permissionsProvider
                .Setup(p => p.Update(It.IsAny<string>(), It.IsAny<PermissionsDto>()))
                .Returns(Task.FromResult(1L));

            await hub.UpdatePermissions(campaignId, permissions);

            clientsMock.Verify(
                c => c.Group(campaignId),
                Times.Once()
            );

            groupClientsMock.Verify(
                c => c.PermissionsUpdated(It.Is<PermissionsDto>(dto =>
                    dto == permissions)),
                Times.Once());
        }

        [Fact]
        public async Task UpdateObjectIgnoresMissingPermissions()
        {
            var campaignId = "test-session";
            collectionProviderMock
                .Setup(cp => cp.UpdateByCampaign("characters", campaignId, "obj-id", It.IsAny<JsonPatchDocument>()))
                .Returns(Task.FromResult(1));
            permissionsProvider
                .Setup(cp => cp.IsAuthorized(It.IsAny<string>(), campaignId, "obj-id"))
                .ReturnsAsync(true);

            var parameters = CreateUpdateCollectionHubParameters(campaignId);
            await hub.UpdateObject(campaignId, parameters);

            VerifyUpdateOnce(campaignId);
        }

        [Fact]
        public async Task UpdateObjectThrowsExceptionWhenUnauthorized()
        {
            var sessionId = "test-session";
            permissionsProvider
                .Setup(cp => cp.Get("test-session", "obj-id"))
                .ReturnsAsync(new PermissionsDto()
                {
                    IsPublic = false
                });

            var parameters = CreateUpdateCollectionHubParameters("campaign-id");
            await Assert.ThrowsAsync<UnauthorizedException>(() => hub.UpdateObject(sessionId, parameters));

            loggerMock.Verify(l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("UnauthorizedException")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()));
        }

        private void VerifyUpdateOnce(string campaignId)
        {
            collectionProviderMock.Verify(
                c => c.UpdateByCampaign(
                    "characters",
                    campaignId,
                    "obj-id",
                    It.IsAny<JsonPatchDocument>()),
                Times.Once);
        }

        private static UpdateCollectionHubParameters CreateUpdateCollectionHubParameters(string campaignId)
        {
            var patch = new JsonPatchDocument().Add("/token/pos", JObject.Parse("{'q': 1, 'r': 2}"));
            var parameters = new UpdateCollectionHubParameters
            {
                Collection = "characters",
                CampaignId = campaignId,
                Id = "obj-id",
                Patch = patch
            };
            return parameters;
        }
    }
} 
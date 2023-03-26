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
using MythicTable.Permissions.Exceptions;
using MythicTable.Permissions.Providers;
using MythicTable.Profile.Data;
using MythicTable.SignalR;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Tests.SignalR
{
    public class LivePlayHubTests
    {
        private const string CampaignId = "test-session";
        private readonly Mock<ICampaignProvider> campaignProviderMock;
        private readonly Mock<ICollectionProvider> collectionProviderMock;
        private readonly Mock<IPermissionsProvider> permissionsProvider;
        private readonly Mock<ILogger<LivePlayHub>> loggerMock;
        private readonly Mock<IHubCallerClients<ILiveClient>> clientsMock;
        private readonly Mock<ILiveClient> allClientsMock;
        private readonly Mock<CampaignDTO> campaign;
        private readonly Mock<CampaignDTO> unownedCampaign;
        private readonly Mock<IProfileProvider> profileProvider;

        private readonly LivePlayHub hub;
        private static JsonPatchDocument patch = new JsonPatchDocument().Add("/token/pos", JObject.Parse("{'q': 1, 'r': 2}"));

        private string User { get; set; } = "test-user";
        private ProfileDto Profile { get; set; }

        public LivePlayHubTests()
        {
            campaign = new Mock<CampaignDTO>();
            unownedCampaign = new Mock<CampaignDTO>();
            campaignProviderMock = new Mock<ICampaignProvider>();
            collectionProviderMock = new Mock<ICollectionProvider>();
            permissionsProvider = new Mock<IPermissionsProvider>();
            loggerMock = new Mock<ILogger<LivePlayHub>>();
            clientsMock = new Mock<IHubCallerClients<ILiveClient>>();
            allClientsMock = new Mock<ILiveClient>();

            unownedCampaign.Object.Owner = "another-user";

            campaignProviderMock
                .Setup(c => c.Get(It.Is<string>(value => value == "not-my-session")))
                .Returns(Task.FromResult<CampaignDTO>(unownedCampaign.Object));
            campaignProviderMock
                .Setup(c => c.Get(It.Is<string>(value => value != "not-my-session")))
                .Returns(Task.FromResult<CampaignDTO>(campaign.Object));
            permissionsProvider
                .Setup(cp => cp.IsAuthorized(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            clientsMock.Setup(m => m.All).Returns(allClientsMock.Object);
            clientsMock.Setup(m => m.Group(It.IsAny<string>())).Returns(allClientsMock.Object);
            allClientsMock
                .Setup(a => a.ConfirmDelta(It.IsAny<CharacterDelta>()))
                .Returns(Task.CompletedTask);
            allClientsMock
                .Setup(a => a.SendMessage(It.IsAny<MessageDto>()))
                .Returns(Task.CompletedTask);
            allClientsMock
                .Setup(a => a.ObjectAdded(It.IsAny<string>(), It.IsAny<JObject>()))
                .Returns(Task.CompletedTask);
            allClientsMock
                .Setup(a => a.ObjectUpdated(It.IsAny<UpdateCollectionHubParameters>()))
                .Returns(Task.CompletedTask);

            profileProvider = new Mock<IProfileProvider>();
            Profile = ProfileTestUtil.CreateProfile(profileProvider, User);
            campaign.Object.Owner = Profile.Id;

            hub = new LivePlayHub(campaignProviderMock.Object, collectionProviderMock.Object, permissionsProvider.Object, profileProvider.Object, new MemoryCache(new MemoryCacheOptions()), loggerMock.Object)
            {
                Clients = clientsMock.Object
            };

            var hubCallerContextMock = new Mock<HubCallerContext>();
            hubCallerContextMock.Setup(c => c.User.FindFirst(It.IsAny<string>()))
                           .Returns(() => new Claim("", User));
            hub.Context = hubCallerContextMock.Object;
        }

        [Fact]
        public async Task ValidMessagesAreExecuted()
        {
            var roll = new MessageDto
            {
                ClientId = "123",
                SessionId = "test",
                Timestamp = 5678,
                Message = "1d5"
            };

            await hub.SendMessage(CampaignId, roll);

            clientsMock.Verify(
                c => c.Group(It.Is<string>(sid => sid == CampaignId)),
                Times.Once()
            );

            allClientsMock.Verify(
                c => c.SendMessage(It.Is<MessageDto>(rolled => rolled.Result != null && rolled.ClientId == "123" && rolled.SessionId == "test" && rolled.Timestamp == 5678)),
                Times.Once());
        }

        [Fact]
        public async Task NonMembersCannotSendMessages()
        {
            const string sessionId = "not-my-session";
            var roll = new MessageDto
            {
                ClientId = "123",
                SessionId = "test",
                Timestamp = 5678,
                Message = "1d5"
            };

            await Assert.ThrowsAsync<UnauthorizedException>(() => hub.SendMessage(sessionId, roll));

            clientsMock.Verify(
                c => c.Group(It.IsAny<string>()),
                Times.Never()
            );

            allClientsMock.Verify(
                c => c.SendMessage(It.IsAny<MessageDto>()),
                Times.Never()
            );
        }

        [Fact]
        public async Task AddCollectionItem()
        {
            var item = new JObject();
            collectionProviderMock
                .Setup(cp => cp.CreateByCampaign(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<JObject>()))
                .Returns(Task.FromResult(item));

            await hub.AddCollectionItem(CampaignId, "characters", "campaign-id", item);

            clientsMock.Verify(
                c => c.Group(It.Is<string>(sid => sid == CampaignId)),
                Times.Once()
            );

            collectionProviderMock.Verify(cp => cp.CreateByCampaign(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<JObject>()), Times.Once);
            allClientsMock.Verify(a => a.ObjectAdded("characters", It.IsAny<JObject>()));
        }

        [Fact]
        public async Task UpdateObject()
        {
            collectionProviderMock
                .Setup(cp => cp.UpdateByCampaign(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<JsonPatchDocument>()))
                .Returns(Task.FromResult(1));

            await hub.UpdateObject(CampaignId, new UpdateCollectionHubParameters
            {
                Collection = "characters",
                CampaignId = "campaign-id",
                Id = "obj-id",
                Patch = patch
            });

            clientsMock.Verify(
                c => c.Group(It.Is<string>(sid => sid == CampaignId)),
                Times.Once()
            );

            collectionProviderMock.Verify(
                c => c.UpdateByCampaign(
                    It.Is<string>(collection => collection == "characters"),
                    It.Is<string>(campaignId => campaignId == "campaign-id"),
                    It.Is<string>(id => id == "obj-id"),
                    It.Is<JsonPatchDocument>(p => p == patch)),
                Times.Once);
            allClientsMock.Verify(a => a.ObjectUpdated(
                    It.Is<UpdateCollectionHubParameters>(p => p.Id == "obj-id" && p.Patch == patch)),
                Times.Once);
        }

        [Fact]
        public async Task UpdateObjectThrowsException()
        {
            collectionProviderMock
                .Setup(cp => cp.UpdateByCampaign(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<JsonPatchDocument>()))
                .ThrowsAsync(new Exception());

            var parameters = new UpdateCollectionHubParameters
            {
                Collection = "characters",
                CampaignId = "campaign-id",
                Id = "obj-id",
                Patch = patch
            };
            await Assert.ThrowsAsync<Exception>(() => hub.UpdateObject(CampaignId, parameters));

            loggerMock.Verify(l => l.Log(
                It.Is<LogLevel>(level => level == LogLevel.Error),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().StartsWith("Error encountered in UpdateObject(test-session, ...)")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)));
        }

        [Fact]
        public async Task UpdateObjectFailsWhenUserIsNotInCampaign()
        {
            const string sessionId = "not-my-session";
            collectionProviderMock
                .Setup(cp => cp.UpdateByCampaign(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<JsonPatchDocument>()))
                .Returns(Task.FromResult(1));

            var parameters = new UpdateCollectionHubParameters
            {
                Collection = "characters",
                CampaignId = sessionId,
                Id = "obj-id",
                Patch = patch
            };

            await Assert.ThrowsAsync<UnauthorizedException>(() => hub.UpdateObject(sessionId, parameters));

            loggerMock.Verify(l => l.Log(
                It.Is<LogLevel>(level => level == LogLevel.Error),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().StartsWith("UnauthorizedException")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)));
        }

        [Fact]
        public async Task RemoveObject()
        {
            collectionProviderMock
                .Setup(cp => cp.Delete(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(1));

            await hub.RemoveObject(CampaignId, "characters", "obj-id");

            clientsMock.Verify(
                c => c.Group(It.Is<string>(sid => sid == CampaignId)),
                Times.Once()
            );

            collectionProviderMock.Verify(
                c => c.Delete(Profile.Id, "characters", "obj-id"),
                Times.Once);
            allClientsMock.Verify(a => a.ObjectRemoved("characters", "obj-id"));
        }

        [Fact]
        public async Task RemoveCampaignObject()
        {
            collectionProviderMock
                .Setup(cp => cp.DeleteByCampaign(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(1));

            await hub.RemoveCampaignObject(CampaignId, "characters", "obj-id");

            clientsMock.Verify(
                c => c.Group(It.Is<string>(sid => sid == CampaignId)),
                Times.Once()
            );

            collectionProviderMock.Verify(
                c => c.DeleteByCampaign("characters", CampaignId, "obj-id"),
                Times.Once);
            allClientsMock.Verify(a => a.ObjectRemoved("characters", "obj-id"));
        }

        [Fact]
        public async Task RemoveObjectDoesNotNotifyOnError()
        {
            collectionProviderMock
                .Setup(cp => cp.Delete(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(0));

            var results = await hub.RemoveObject(CampaignId, "characters", "obj-id");

            Assert.False(results);

            clientsMock.Verify(
                c => c.Group(It.Is<string>(sid => sid == CampaignId)),
                Times.Never()
            );
            collectionProviderMock.Verify(
                c => c.Delete(Profile.Id, "characters", "obj-id"),
                Times.Once);
            allClientsMock.Verify(a => a.ObjectRemoved(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }
    }
}

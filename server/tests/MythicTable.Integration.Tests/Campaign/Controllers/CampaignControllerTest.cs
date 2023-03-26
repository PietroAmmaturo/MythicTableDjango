using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Mongo2Go;
using MongoDB.Driver;
using Moq;
using MythicTable.Campaign.Controllers;
using MythicTable.Campaign.Data;
using MythicTable.Campaign.Exceptions;
using MythicTable.Collections.Providers;
using MythicTable.Profile.Data;
using Xunit;

namespace MythicTable.Integration.Tests.Campaign.Controllers
{
    public class CampaignControllerTest : IAsyncLifetime
    {
        private const string DoesNotExistId = "551137c2f9e1fac808a5f572";

        private MongoDbRunner runner;

        private CampaignController controller;
        
        private ICampaignProvider campaignProvider;
        private ICollectionProvider collectionProvider;
        private IProfileProvider profileProvider;

        private string User { get; set; } = "Jon";
        private ProfileDto Owner { get; set; }
        private ProfileDto Player { get; set; }

        public async Task InitializeAsync()
        {
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"
            };
            var client = new MongoClient(settings.ConnectionString);

            campaignProvider = new MongoDbCampaignProvider(settings, client);
            collectionProvider = new MongoDbCollectionProvider(settings, client, Mock.Of<ILogger<MongoDbCollectionProvider>>());
            profileProvider = new MongoDbProfileProvider(settings, client, Mock.Of<ILogger<MongoDbProfileProvider>>(), new MemoryCache(new MemoryCacheOptions()));
            controller = new CampaignController(campaignProvider, collectionProvider, profileProvider, new MemoryCache(new MemoryCacheOptions()));

            await profileProvider.Create(new ProfileDto(), User);
            Owner = await profileProvider.Create(new ProfileDto(), "owner");
            Player = await profileProvider.Create(new ProfileDto(), "player1");

            var mockHttpContext = new Mock<HttpContext>();
            mockHttpContext.Setup(hc => hc.User.FindFirst(It.IsAny<string>()))
                            .Returns(() => new Claim("", User));
            controller.ControllerContext.HttpContext = mockHttpContext.Object;
        }

        public Task DisposeAsync()
        {
            runner.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public void TestConstructorWithNullCampaignProviderThrowsException()
        {
            static CampaignController Construction() => new CampaignController(null, null, null, null);

            Assert.Throws<ArgumentNullException>("campaignProvider", (Func<CampaignController>) Construction);
        }

        [Fact]
        public async void TestPostSucceedsAsync()
        {
            var testCampaign = new CampaignDTO
            {
                Name = "Test Campaign"
            };

            var response = await controller.PostCampaign(testCampaign);
            var actionResult = response.Result as CreatedAtActionResult;
            Assert.Equal(201, actionResult.StatusCode);
            var resultCampaign = actionResult.Value as CampaignDTO;
            Assert.Equal(testCampaign.Name, resultCampaign.Name);
        }

        [Fact]
        public async void TestPostSetsUserAsOwnerAsync()
        {
            User = "owner";
            var testCampaign = new CampaignDTO
            {
                Name = "Test Campaign"
            };

            var response = await controller.PostCampaign(testCampaign);
            var actionResult = response.Result as CreatedAtActionResult;
            Assert.Equal(201, actionResult.StatusCode);
            var resultCampaign = actionResult.Value as CampaignDTO;
            Assert.Equal(Owner.Id, resultCampaign.Owner);
        }

        [Fact]
        public async void TestPostReturnsBadRequestForNullCampaignsAsync()
        {
            async Task PostCampaignWithoutId() => await controller.PostCampaign(null);
            await Assert.ThrowsAsync<CampaignInvalidException>(PostCampaignWithoutId);
        }

        [Fact]
        public async void TestPutSucceedsAsync()
        {
            var testCampaign = await CreateAndPostTestCampaign();

            testCampaign.Name = "Modified";
            var putResponse = await controller.PutCampaign(testCampaign.Id, testCampaign) as NoContentResult;
            Assert.Equal(204, putResponse.StatusCode);
        }

        [Fact]
        public async void TestPutReturnsBadRequestForNullCampaignAsync()
        {
            var testCampaign = await CreateAndPostTestCampaign();
            async Task PutCampaignWithoutId() => await controller.PutCampaign(testCampaign.Id, null);
            await Assert.ThrowsAsync<CampaignInvalidException>(PutCampaignWithoutId);
        }

        [Fact]
        public async void TestPutReturnsBadRequestForBadCampaignIdAsync()
        {
            async Task PutCampaignWithNullId() => await controller.PutCampaign(null, new CampaignDTO {Name = "Test Campaign"});

            await Assert.ThrowsAsync<CampaignInvalidException>(PutCampaignWithNullId);

            async Task PutCampaignWithEmptyId() => await controller.PutCampaign("", new CampaignDTO {Name = "Test Campaign"});

            await Assert.ThrowsAsync<CampaignInvalidException>(PutCampaignWithEmptyId);

        }

        [Fact]
        public async void TestGetReturnsValidResultAsync()
        {
            var testCampaign = await CreateAndPostTestCampaign();

            var getResult = await controller.GetCampaign(testCampaign.Id) as ActionResult<CampaignDTO>;
            Assert.Equal(testCampaign.Name, getResult.Value.Name);
            Assert.Equal(testCampaign.Id, getResult.Value.Id);
        }

        [Fact]
        public async void TestGetReturnsNoCampaignsAsync()
        {
            async Task GetUnknownCampaign() => await controller.GetCampaign(DoesNotExistId);
            await Assert.ThrowsAsync<CampaignNotFoundException>(GetUnknownCampaign);
        }

        [Fact]
        public async void TestGetMultipleReturnsValidResultAsync()
        {
            var getResult1 = await controller.GetCampaigns() as ActionResult<List<CampaignDTO>>;
            var testCampaign1 = await CreateAndPostTestCampaign();
            var testCampaign2 = await CreateAndPostTestCampaign();
            var getResult2 = await controller.GetCampaigns() as ActionResult<List<CampaignDTO>>;

            var campaign1 = getResult1.Value as List<CampaignDTO>;
            var campaign2 = getResult2.Value as List<CampaignDTO>;
            // TODO this will be more graceful once we can clear out the mongodb on each run
            Assert.Equal(2, campaign2.Count - campaign1.Count);
            Assert.Equal(testCampaign1.Id, campaign2[^2].Id);
            Assert.Equal(testCampaign1.Name, campaign2[^2].Name);
            Assert.Equal(testCampaign2.Id, campaign2[^1].Id);
            Assert.Equal(testCampaign2.Name, campaign2[^1].Name);
        }

        [Fact]
        public async void TestDeleteAsync()
        {
            var testCampaign = await CreateAndPostTestCampaign();
            var response = await controller.DeleteCampaign(testCampaign.Id) as ActionResult<CampaignDTO>;
            Assert.Equal(testCampaign.Name, response.Value.Name);
            Assert.Equal(testCampaign.Id, response.Value.Id);
        }

        [Fact]
        public async void TestDeleteInvalidIdFailsAsync()
        {
            async Task DeleteUnknownCampaign() => await controller.DeleteCampaign(DoesNotExistId);
            await Assert.ThrowsAsync<CampaignNotFoundException>(DeleteUnknownCampaign);
        }

        [Fact]
        public async void TestJoinNonExistantCampaignFailsAsync()
        {
            async Task JoinNonExistantCampaign() => await controller.Join(DoesNotExistId);
            await Assert.ThrowsAsync<CampaignNotFoundException>(JoinNonExistantCampaign);
        }

        [Fact]
        public async void TestJoinAddsPlayerAsync()
        {
            User = "owner";
            var testCampaign = await CreateAndPostTestCampaign();
            User = "player1";
            var response = await controller.Join(testCampaign.JoinId);
            var getResult = response as ActionResult<CampaignDTO>;
            Assert.Equal(testCampaign.Name, getResult.Value.Name);
            Assert.Equal(testCampaign.Id, getResult.Value.Id);
            var campaigns = getResult.Value.Players;
            Assert.Single(campaigns);
            Assert.Equal(Player.Id, campaigns[0].Name);
        }

        [Fact]
        public async void TestLeaveNonExistantCampaignFailsAsync()
        {
            async Task LeaveUnknownCampaign() => await controller.Leave(DoesNotExistId);
            await Assert.ThrowsAsync<CampaignNotFoundException>(LeaveUnknownCampaign);
        }

        [Fact]
        public async void TestLeaveCampaignNotInFailsAsync()
        {
            User = "owner";
            var testCampaign = await CreateAndPostTestCampaign();
            User = "player1";
            async Task LeaveNonParticipatoryCampaign() => await controller.Leave(testCampaign.Id);
            await Assert.ThrowsAsync<CampaignRemovePlayerException>(LeaveNonParticipatoryCampaign);
        }

        [Fact]
        public async void TestLeaveRemovesPlayerAsync()
        {
            User = "owner";
            var testCampaign = await CreateAndPostTestCampaign();
            User = "player1";
            await controller.Join(testCampaign.JoinId);
            var response = await controller.Leave(testCampaign.Id);
            var getResult = response as ActionResult<CampaignDTO>;
            var campaigns = getResult.Value.Players;
            Assert.Empty(campaigns);
        }

        [Fact]
        public async void TestForceLeaveCampaignNotInFailsAsync()
        {
            User = "owner";
            var testCampaign = await CreateAndPostTestCampaign();
            User = "player1";
            async Task LeaveNonParticipatoryCampaign() => await controller.ForceLeave(testCampaign.Id, "nonExistantId");
            await Assert.ThrowsAsync<CampaignRemovePlayerException>(LeaveNonParticipatoryCampaign);
        }

        [Fact]
        public async void TestForceLeaveRemovesPlayerAsync()
        {
            User = "owner";
            var testCampaign = await CreateAndPostTestCampaign();
            User = "player1";
            var campaignWithPlayer = await controller.Join(testCampaign.JoinId) as ActionResult<CampaignDTO>;
            var response = await controller.ForceLeave(testCampaign.Id, campaignWithPlayer.Value.Players[0].Name);
            var getResult = response as ActionResult<CampaignDTO>;
            var campaigns = getResult.Value.Players;
            Assert.Empty(campaigns);
        }

        [Fact]
        public async void TestJoiningTwoCampaigns()
        {
            var testCampaign1 = await CreateAndPostTestCampaign();
            var testCampaign2 = await CreateAndPostTestCampaign();
            var response = await controller.Join(testCampaign1.JoinId);
            var getResult = response as ActionResult<CampaignDTO>;
            Assert.Equal(testCampaign1.Id, getResult.Value.Id);
            response = await controller.Join(testCampaign2.JoinId);
            getResult = response as ActionResult<CampaignDTO>;
            Assert.Equal(testCampaign2.Id, getResult.Value.Id);
        }

        private async Task<CampaignDTO> CreateAndPostTestCampaign()
        {
            var testCampaign = new CampaignDTO
            {
                Name = "Test Campaign"
            };

            var response = await controller.PostCampaign(testCampaign);
            var actionResult = response.Result as CreatedAtActionResult;
            Assert.Equal(201, actionResult.StatusCode);
            return (CampaignDTO)actionResult.Value;
        }
    }
}
using System.Threading.Tasks;
using System.Collections.Generic;
using Mongo2Go;
using MongoDB.Driver;
using MythicTable.Campaign.Data;
using MythicTable.Campaign.Exceptions;
using MythicTable.TestUtils.Util;
using Xunit;

namespace MythicTable.Integration.Tests.Campaign.Data
{
    public class MongoDbCampaignProviderTests : IAsyncLifetime
    {
        private MongoDbRunner runner;
        private ICampaignProvider provider;
        private const string DoesntExistId = "551137c2f9e1fac808a5f572";
        private const string CampaignOwner = "test player";

        public Task InitializeAsync()
        {
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings 
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"
            };
            var client = new MongoClient(settings.ConnectionString);
            provider = new MongoDbCampaignProvider(settings, client);
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            runner.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async void TestCreateCampaignAsync()
        {
            var campaign = new CampaignDTO{Name = "Test"};

            var resultCampaign = await provider.Create(campaign, CampaignOwner);
            Assert.Equal(campaign.Name, resultCampaign.Name);
            Assert.Equal(CampaignOwner, resultCampaign.Owner);
        }

        [Fact]
        public async void TestNullCampaignThrowsExceptionOnCreateAsync()
        {
            await Assert.ThrowsAsync<CampaignInvalidException>(() => provider.Create(null, CampaignOwner));
        }

        [Fact]
        public async void TestCampaignWithIdThrowsExceptionOnCreateAsync()
        {
            await Assert.ThrowsAsync<CampaignInvalidException>(() => provider.Create(new CampaignDTO{Id = DoesntExistId}, CampaignOwner));
        }

        [Fact]
        public async void TestUpdateAsync()
        {
            var testCampaign = await CreateCampaign();
            testCampaign.Name = "Modified";

            var resultingCampaign = await provider.Update(testCampaign.Id, testCampaign);
            
            Assert.Equal(testCampaign.Name, resultingCampaign.Name);
        }

        [Fact]
        public async void TestNullCampaignThrowsExceptionOnUpdateAsync()
        {
            var testCampaign = await CreateCampaign();
            await Assert.ThrowsAsync<CampaignInvalidException>(() => provider.Update(testCampaign.Id, null));
        }

        [Fact]
        public async void TestCampaignWithoutIdThrowsExceptionOnUpdateAsync()
        {
            await Assert.ThrowsAsync<CampaignInvalidException>(() => provider.Update(null, new CampaignDTO{Name = "test"}));
            await Assert.ThrowsAsync<CampaignInvalidException>(() => provider.Update("", new CampaignDTO{Name = "test"}));
        }

        [Fact]
        public async void TestUpdateCampaignWillNotChangeId()
        {
            var testCampaign = await CreateCampaign();
            var prevId = testCampaign.Id;

            testCampaign.Description = "A description";
            testCampaign.Id = "invalid";

            var result = await provider.Update(prevId, testCampaign);

            testCampaign.Id = prevId;
            Assert.Equal(testCampaign, result);
        }

        [Fact]
        public async void TestNonOwnerUserCannotUpdateCampaign()
        {
            var testCampaign = await CreateCampaign();
        }

        [Fact]
        public async void TestGetCampaignAsync()
        {
            var testCampaign = await CreateCampaign();

            var results = await provider.Get(testCampaign.Id);
            Assert.Equal(testCampaign.Name, results.Name);
            Assert.Equal(testCampaign.Id, results.Id);
        }

        [Fact]
        public async void TestGetByJoinIdAsync()
        {
            var testCampaign = await CreateCampaign();

            var results = await provider.GetByJoinId(testCampaign.JoinId);
            Assert.Equal(testCampaign.Name, results.Name);
            Assert.Equal(testCampaign.Id, results.Id);
        }

        [Fact]
        public async void TestGetReturnsNoCampaignsAsync()
        {
            await Assert.ThrowsAsync<CampaignNotFoundException>(() => provider.Get(DoesntExistId));
        }

       [Fact]
        public async void TestGetAllCampaignsAsync()
        {
            var results1 = await provider.GetAll(CampaignOwner);
            var testCampaign1 = await CreateCampaign();
            var testCampaign2 = await CreateCampaign();
            var testCampaign3 = await CreateCampaign("test owner");//This should NOT show up
            var results2 = await provider.GetAll(CampaignOwner);

            Assert.Equal(2, results2.Count - results1.Count);
            Assert.Equal(testCampaign1.Id, results2[results2.Count-2].Id);
            Assert.Equal(testCampaign1.Name, results2[results2.Count-2].Name);
            Assert.Equal(testCampaign2.Id, results2[results2.Count-1].Id);
            Assert.Equal(testCampaign2.Name, results2[results2.Count-1].Name);
        }

        [Fact]
        public async void TestDeleteAsync()
        {
            var testCampaign = await CreateCampaign();
            await provider.Delete(testCampaign.Id);
            await Assert.ThrowsAsync<CampaignNotFoundException>(() => provider.Get(testCampaign.Id));
        }

        [Fact]
        public async void TestDeleteInvalidIdFailsAsync()
        {
            await Assert.ThrowsAsync<CampaignNotFoundException>(() => provider.Delete(DoesntExistId));
        }

        [Fact]
        public async void TestPlayersAreEmptyWithNewCampaignAsync()
        {
            var testCampaign = await CreateCampaign();
            var result = await provider.GetPlayers(testCampaign.Id);
            Assert.Empty(result);
        }

        [Fact]
        public async void TestGetPlayersThrowsOnInvalidCampaignAsync()
        {
            await Assert.ThrowsAsync<CampaignNotFoundException>(() => provider.GetPlayers(DoesntExistId));
        }

        [Fact]
        public async void TestAddPlayersToCampaignAsync()
        {
            var testCampaign = await CreateCampaign();
            var campaign = await provider.AddPlayer(testCampaign.Id, new PlayerDTO{Name = CampaignOwner});
            Assert.Single(campaign.Players);
        }

        [Fact]
        public async void TestAddPlayerTwiceCausesErrorAsync()
        {
            var testCampaign = await CreateCampaign();
            await provider.AddPlayer(testCampaign.Id, new PlayerDTO{Name = CampaignOwner});
            await Assert.ThrowsAsync<CampaignAddPlayerException>(() => provider.AddPlayer(testCampaign.Id, new PlayerDTO{Name = CampaignOwner}));
        }

        [Fact]
        public async void TestRemovingPlayerNonExistentCampaignCausesErrorAsync()
        {
            await Assert.ThrowsAsync<CampaignNotFoundException>(() => provider.RemovePlayer(DoesntExistId, new PlayerDTO { Name = CampaignOwner }));
        }

        [Fact]
        public async void TestRemovingPlayerFromEmptyCampaignCausesErrorAsync()
        {
            var testCampaign = await CreateCampaign();
            await Assert.ThrowsAsync<CampaignRemovePlayerException>(() => provider.RemovePlayer(testCampaign.Id, new PlayerDTO{Name = CampaignOwner}));
        }

        [Fact]
        public async void TestRemovingPlayerRemovesThemFromCampaignAsync()
        {
            var testCampaign = await CreateCampaign();
            var player = new PlayerDTO{Name = CampaignOwner};
            await provider.AddPlayer(testCampaign.Id, player);
            await provider.RemovePlayer(testCampaign.Id, player);
            await Assert.ThrowsAsync<CampaignRemovePlayerException>(() => provider.RemovePlayer(testCampaign.Id, player));
        }

        [Fact]
        public async void TestRemovingWrongPlayerCausesErrorAsync()
        {
            var testCampaign = await CreateCampaign();
            var response = await provider.AddPlayer(testCampaign.Id, new PlayerDTO{Name = CampaignOwner});
            await Assert.ThrowsAsync<CampaignRemovePlayerException>(() => provider.RemovePlayer(testCampaign.Id, new PlayerDTO{Name = "WRONG player"}));
        }

        [Fact]
        public async void TestPlayersShowInCampaignAsync()
        {
            var testCampaign = await CreateCampaign();
            var player = new PlayerDTO{Name = CampaignOwner};
            await provider.AddPlayer(testCampaign.Id, player);

            var results = await provider.Get(testCampaign.Id);
            
            Assert.Single(results.Players);
        }

        [Fact]
        public async void TestGetMessagesReturnEmptyListAsync()
        {
            var testCampaign = await CreateCampaign();

            var roll = new MessageDto();
            var results = await provider.GetMessages(testCampaign.Id);

            Assert.Empty(results);
        }

        [Fact]
        public async void TestAddRollAsync()
        {
            var testCampaign = await CreateCampaign();

            var roll = new MessageDto();
            await provider.AddMessage(testCampaign.Id, roll);
            var results = await provider.GetMessages(testCampaign.Id);
            
            Assert.Single(results);
        }

        [Fact]
        public async void TestMessagePageLimits()
        {
            var testCampaign = await CreateCampaign();

            for(int i = 0; i < 100; ++i) {
                var roll = new MessageDto();
                roll.Message = $"{i}";
                await provider.AddMessage(testCampaign.Id, roll);
            }

            var messages = await provider.GetMessages(testCampaign.Id);
            Assert.Equal(createMessageList(50,100), messages);

            messages = await provider.GetMessages(testCampaign.Id, 25);
            Assert.Equal(createMessageList(75,100), messages);

            messages = await provider.GetMessages(testCampaign.Id, 101);
            Assert.Equal(createMessageList(0,100), messages);
        }

        
        [Fact]
        public async void TestMessagePages()
        {
            var testCampaign = await CreateCampaign();
            var shortCampaign = await CreateCampaign();

            for(int i = 0; i < 149; ++i) {
                var roll = new MessageDto();
                roll.Message = $"{i}";
                await provider.AddMessage(testCampaign.Id, roll);

                if(i < 49) {
                    await provider.AddMessage(shortCampaign.Id, roll);
                }
            }

            var messages = await provider.GetMessages(testCampaign.Id, page: 1);
            Assert.Equal(createMessageList(99,149), messages);

            messages = await provider.GetMessages(testCampaign.Id, page: 2);
            Assert.Equal(createMessageList(49,99), messages);

            messages = await provider.GetMessages(testCampaign.Id, page: 3);
            Assert.Equal(createMessageList(0,49), messages);
            
            messages = await provider.GetMessages(testCampaign.Id, page: 4);
            Assert.Equal(createMessageList(0,0), messages);
            
            //Short campaign tests
            messages = await provider.GetMessages(shortCampaign.Id, pageSize: 25);
            Assert.Equal(createMessageList(24,49), messages);

            messages = await provider.GetMessages(shortCampaign.Id, page: 2); //PageSize is default 50
            Assert.Equal(createMessageList(0,0), messages);
        }

        private List<MessageDto> createMessageList(int start, int end)
        {
            List<MessageDto> retVal = new List<MessageDto>();

            for(int i = start; i < end; ++i)
            {
                var val = new MessageDto();
                val.Message = $"{i}";
                retVal.Add(val);
            }
            return retVal;
        }

        private async Task<CampaignDTO> CreateCampaign(string owner=CampaignOwner)
        {
            return await provider.Create(new CampaignDTO{Name = StringHelpers.RandomString(8)}, owner);
        }
    }
}
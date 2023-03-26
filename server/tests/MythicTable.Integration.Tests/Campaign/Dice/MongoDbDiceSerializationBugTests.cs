using System.Linq;
using System.Threading.Tasks;
using Dice;
using Mongo2Go;
using MongoDB.Driver;
using MythicTable.Campaign.Data;
using MythicTable.TestUtils.TextParsing;
using MythicTable.TestUtils.Util;
using MythicTable.TextParsing;
using Xunit;

namespace MythicTable.Integration.Tests.Campaign.Dice
{
    public class MongoDbDiceSerializationBugTests : IAsyncLifetime
    {
        private MongoDbRunner runner;
        private ICampaignProvider provider;

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
        public async void DiceShouldSerialize()
        {
            var testCampaign = await CreateCampaign();
            var message = new MessageDto {Message = "Alice rolled [[1d6+3]] and [[1d20-4]]"};
            var config = new RollerConfig
            {
                GetRandomBytes = Helper.GetRng(Helper.Roll1())
            };
            var parser = new ChatParser(new SkizzerzRoller(config));

            var rollResults = parser.Process(message.Message);
            message.Result = rollResults.AsDto();
            await provider.AddMessage(testCampaign.Id, message);
            var results = await provider.GetMessages(testCampaign.Id);
            
            Assert.Single(results);
            var diceResults = results[0].Result.Elements
                .Where(e => e.Results != null)
                .Select(e => e.Results);
            Assert.Equal(2, diceResults.Count());
        }

        private async Task<CampaignDTO> CreateCampaign(string owner="CampaignOwner")
        {
            return await provider.Create(new CampaignDTO{Name = StringHelpers.RandomString(8)}, owner);
        }
    }
}
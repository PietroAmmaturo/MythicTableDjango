using System.Threading.Tasks;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.Extensions.Logging;
using Mongo2Go;
using MongoDB.Bson;
using MongoDB.Driver;
using Moq;
using MythicTable.Campaign.Util;
using MythicTable.Collections.Providers;
using Xunit;

namespace MythicTable.Integration.Tests.Collections.Characters
{
    public class MongoDbCharacterSerializationBugTest : IAsyncLifetime
    {
        private const string UserId = "test-user";

        private MongoDbRunner runner;
        public Mock<ILogger<MongoDbCollectionProvider>> LoggerMock;
        private MongoDbCollectionProvider provider;

        public Task InitializeAsync()
        {
            LoggerMock = new Mock<ILogger<MongoDbCollectionProvider>>();
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings 
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"
            };
            var client = new MongoClient(settings.ConnectionString);
            provider = new MongoDbCollectionProvider(settings, client, LoggerMock.Object);
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            runner.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task CreateCollectionCharacterRequiresBson()
        {
            var results = await provider.CreateByCampaign(
                UserId,
                "characters",
                "campaignId",
                CharacterUtil.CreateCollectionCharacter(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Redcap", "Goblin rogue", null, null)
            );

            var found = await provider.GetListByCampaign("characters", "campaignId");
            Assert.Single(found);

            var patch = new JsonPatchDocument().Replace("/pos/r", 5);
            await provider.UpdateByCampaign("characters", "campaignId", results.GetId(), patch);
        }
    }
}

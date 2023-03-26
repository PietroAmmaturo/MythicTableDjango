using System.Threading.Tasks;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.Extensions.Logging;
using Mongo2Go;
using MongoDB.Driver;
using Moq;
using MythicTable.Collections.Providers;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Integration.Tests.Collections.Providers
{
    public class MongoDbCollectionProviderForCampaignsTest : IAsyncLifetime
    {
        private const string userId = "test-user";
        private const string secondUserId = "other-user";
        private const string collectionName = "test";
        private const string campaignId = "campaign-test";
        private const string secondCampaignId = "campaign-test2";

        private MongoDbRunner runner;
        public Mock<ILogger<MongoDbCollectionProvider>> loggerMock;
        private MongoDbCollectionProvider provider;

        public Task InitializeAsync()
        {
            loggerMock = new Mock<ILogger<MongoDbCollectionProvider>>();
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"

            };
            var client = new MongoClient(settings.ConnectionString);
            provider = new MongoDbCollectionProvider(settings, client, loggerMock.Object);
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            runner.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task GetByCampaignReturnsEmptyListWhenNotPresent()
        {
            var jObjects = await provider.GetListByCampaign(collectionName, campaignId);
            Assert.Empty(jObjects);
        }

        [Fact]
        public async Task CreateByCampaignGeneratesId()
        {
            var jObject = await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());
            var jObjects = await provider.GetListByCampaign(collectionName, campaignId);
            Assert.Single(jObjects);
            Assert.NotNull(jObject.GetId());
            Assert.Equal(jObject.GetId(), jObjects[0].GetId());
        }

        [Fact]
        public async Task CollectionsAreCampaignSpecific()
        {
            var jObject = await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());

            Assert.Single(await provider.GetListByCampaign(collectionName, campaignId));
            Assert.Empty(await provider.GetListByCampaign(collectionName, secondCampaignId));
        }

        [Fact]
        public async Task GetAllCombinesCampaigns()
        {
            await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());
            await provider.CreateByCampaign(userId, collectionName, secondCampaignId, new JObject());

            Assert.Equal(2, (await provider.GetList(userId, collectionName)).Count);
        }

        [Fact]
        public async Task CreatesAndGetSingle()
        {
            var jObject = await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());
            var found = await provider.GetByCampaign(collectionName, campaignId, jObject.GetId());
            Assert.Equal(jObject.GetId(), found.GetId());
        }

        [Fact]
        public async Task UpdatesJObject()
        {
            var jObject = await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());

            var patch = new JsonPatchDocument().Add("foo", "bar");
            var numUpdated = await provider.UpdateByCampaign(collectionName, campaignId, jObject.GetId(), patch);
            Assert.Equal(1, numUpdated);

            var jObjects = await provider.GetListByCampaign(collectionName, campaignId);
            Assert.Single(jObjects);
            Assert.Equal("bar", jObjects[0]["foo"]);
        }

        [Fact]
        public async Task CampaignObjectsAreAccessibleDirectly()
        {
            var created = await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());

            var found = await provider.Get(userId, collectionName, created.GetId());

            Assert.NotNull(found);
        }

        [Fact]
        public async Task CampaignObjectsAreCanBeModifiedDirectly()
        {
            var created = await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());

            JsonPatchDocument patch = new JsonPatchDocument().Add("foo", "bar");
            var numUpdated = await provider.Update(userId, collectionName, created.GetId(), patch);
            Assert.Equal(1, numUpdated);

            var found = await provider.Get(userId, collectionName, created.GetId());

            Assert.NotNull(found);
            Assert.Equal("bar", found["foo"]);
        }

        [Fact]
        public async Task CampaignObjectsDeletedDirectlyAreRemovedFromCampaign()
        {
            var created = await provider.CreateByCampaign(userId, collectionName, campaignId, new JObject());

            var numDeleted = await provider.Delete(userId, collectionName, created.GetId());
            Assert.Equal(1, numDeleted);

            Assert.Empty(await provider.GetListByCampaign(collectionName, campaignId));
        }
    }
}

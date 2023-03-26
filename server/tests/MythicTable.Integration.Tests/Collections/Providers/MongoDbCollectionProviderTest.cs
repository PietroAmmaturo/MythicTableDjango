using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.Extensions.Logging;
using Mongo2Go;
using MongoDB.Driver;
using Moq;
using MythicTable.Collections.Providers;
using MythicTable.Common.Exceptions;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Integration.Tests.Collections.Providers
{
    public class MongoDbCollectionProviderTest : IAsyncLifetime
    {
        private const string UserId = "test-user";
        private const string SecondUserId = "other-user";
        private const string CollectionName = "test";
        private const string MissingId = "012345678901234567890123";

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
        public async Task GetReturnsEmptyListWhenNotPresent()
        {
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Empty(jObjects);
        }

        [Fact]
        public async Task CreatesAndGetsJObject()
        {
            await provider.Create(UserId, CollectionName, new JObject());
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
        }

        [Fact]
        public async Task CreatesGeneratesId()
        {
            var jObject = await provider.Create(UserId, CollectionName, new JObject());
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.NotNull(jObject.GetId());
            Assert.Equal(jObject.GetId(), jObjects[0].GetId());
        }

        [Fact]
        public async Task CreatesGeneratesUniqueId()
        {
            var jObject1 = await provider.Create(UserId, CollectionName, new JObject());
            var jObject2 = await provider.Create(UserId, CollectionName, new JObject());
            Assert.NotEqual(jObject1.GetId(), jObject2.GetId());
        }

        [Fact]
        public async Task JObjectTypesAreExcluse()
        {
            await provider.Create(UserId, CollectionName, new JObject());
            var jObjects = await provider.GetList(UserId, "other-type");
            Assert.Empty(jObjects);
        }

        [Fact]
        public async Task GetWithWrongUserIdReturnsNothing()
        {
            await provider.Create(UserId, CollectionName, new JObject());
            var jObjects = await provider.GetList(SecondUserId, CollectionName);
            Assert.Empty(jObjects);
        }

        [Fact]
        public async Task MaintainsTwoTypes()
        {
            await provider.Create(UserId, CollectionName, new JObject { { "name", "test1" } });
            await provider.Create(UserId, "test2", new JObject { { "name", "test2" } });
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.Equal("test1", jObjects[0]["name"]);
            jObjects = await provider.GetList(UserId, "test2");
            Assert.Single(jObjects);
            Assert.Equal("test2", jObjects[0]["name"]);
        }

        [Fact]
        public async Task CanDelete()
        {
            var jObject = await provider.Create(UserId, CollectionName, new JObject());
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            var numDeleted = await provider.Delete(UserId, CollectionName, jObject.GetId());
            Assert.Equal(1, numDeleted);
            jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Empty(jObjects);
        }

        [Fact]
        public async Task DeleteFromWrongCollectionFailsToDelete()
        {
            var jObject = await provider.Create(UserId, CollectionName, new JObject());
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            var numDeleted = await provider.Delete(UserId, "wrong-collection", jObject.GetId());
            Assert.Equal(0, numDeleted);
            jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
        }

        [Fact]
        public async Task UpdatesJObject()
        {
            var jObject = await provider.Create(UserId, CollectionName, new JObject());
            await provider.GetList(UserId, CollectionName);

            JsonPatchDocument patch = new JsonPatchDocument().Add("foo", "bar");
            var numUpdated = await provider.Update(UserId, CollectionName, jObject.GetId(), patch);

            Assert.Equal(1, numUpdated);
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.Equal("bar", jObjects[0]["foo"]);
        }

        [Fact]
        public async Task UpdatesByAddingObject()
        {
            var jObject = await provider.Create(UserId, CollectionName, new JObject());
            await provider.GetList(UserId, CollectionName);

            var patch = new JsonPatchDocument().Add("foo", JObject.Parse("{'value': 'bar'}"));
            var numUpdated = await provider.Update(UserId, CollectionName, jObject.GetId(), patch);

            Assert.Equal(1, numUpdated);
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.Equal("bar", jObjects[0]["foo"]["value"]);
        }

        [Fact]
        public async Task UpdatesByRemoving()
        {
            var o = JObject.Parse("{'value': {'foo': 'bar'}}");
            var jObject = await provider.Create(UserId, CollectionName, o);
            await provider.GetList(UserId, CollectionName);

            var patch = new JsonPatchDocument().Remove("value/foo");
            var numUpdated = await provider.Update(UserId, CollectionName, jObject.GetId(), patch);

            Assert.Equal(1, numUpdated);
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.Equal(JObject.Parse("{}"), jObjects[0]["value"]);
        }

        [Fact]
        public async Task GetThrowsWhenNoCollectionNotFound()
        {
            var exception = await Assert.ThrowsAsync<MythicTableException>(() => provider.Get(UserId, CollectionName, "some item"));

            string expected = $"Could not find item 'some item' in collection '{CollectionName}' for user '{UserId}'";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task GetThrowsWhenNoItemNotFound()
        {
            await provider.Create(UserId, CollectionName, new JObject());
            var exception = await Assert.ThrowsAsync<MythicTableException>(() => provider.Get(UserId, CollectionName, "some item"));

            string expected = $"Could not find item 'some item' in collection '{CollectionName}' for user '{UserId}'";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task FailedDeleteLogsTheFailure()
        {
            var numDeleted = await provider.Delete(UserId, CollectionName, MissingId);

            Assert.Equal(0, numDeleted);
            string expected = $"Could not delete item '{MissingId}' in collection '{CollectionName}' for user '{UserId}'";
            VerifyLog(LogLevel.Warning, expected);
        }

        [Fact]
        public async Task RecordsOwner()
        {
            var jObject = await provider.Create(UserId, CollectionName, new JObject());
            Assert.Equal(UserId, jObject["_userid"]);
        }

        [Fact]
        public async Task FailedUpdateLogsTheFailure()
        {
            JsonPatchDocument patch = new JsonPatchDocument().Add("foo", "bar");
            var numUpdated = await provider.Update(UserId, CollectionName, MissingId, patch);

            Assert.Equal(0, numUpdated);
            string expected = $"Could not update item '{MissingId}' in collection '{CollectionName}' for user '{UserId}'";
            VerifyLog(LogLevel.Warning, expected);
        }
        [Fact]
        public async Task UpdatesByRemovingArrayHeadElement()
        {
            var o = JObject.Parse("{'value': {'foo': [{ 'bar1': 1 }, { 'bar2': 2 }, { 'bar3': 3 }]}}");
            var jObject = await provider.Create(UserId, CollectionName, o);
            await provider.GetList(UserId, CollectionName);

            var patch = new JsonPatchDocument().Remove("value/foo/0");
            var numUpdated = await provider.Update(UserId, CollectionName, jObject.GetId(), patch);

            Assert.Equal(1, numUpdated);
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.Equal(JToken.Parse("[{ 'bar2': 2 }, { 'bar3': 3 }]"), jObjects[0]["value"]["foo"]);
        }
        [Fact]
        public async Task UpdatesByRemovingArrayMiddleElement()
        {
            var o = JObject.Parse("{'value': {'foo': [{ 'bar1': 1 }, { 'bar2': 2 }, { 'bar3': 3 }]}}");
            var jObject = await provider.Create(UserId, CollectionName, o);
            await provider.GetList(UserId, CollectionName);

            var patch = new JsonPatchDocument().Remove("value/foo/1");
            var numUpdated = await provider.Update(UserId, CollectionName, jObject.GetId(), patch);

            Assert.Equal(1, numUpdated);
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.Equal(JToken.Parse("[{ 'bar1': 1 }, { 'bar3': 3 }]"), jObjects[0]["value"]["foo"]);
        }


        [Fact]
        public async Task UpdatesByRemovingArrayTailElement()
        {
            var o = JObject.Parse("{'value': {'foo': [{ 'bar1': 1 }, { 'bar2': 2 }, { 'bar3': 3 }]}}");
            var jObject = await provider.Create(UserId, CollectionName, o);
            await provider.GetList(UserId, CollectionName);

            var patch = new JsonPatchDocument().Remove("value/foo/2");
            var numUpdated = await provider.Update(UserId, CollectionName, jObject.GetId(), patch);

            Assert.Equal(1, numUpdated);
            var jObjects = await provider.GetList(UserId, CollectionName);
            Assert.Single(jObjects);
            Assert.Equal(JToken.Parse("[{ 'bar1': 1 }, { 'bar2': 2 }]"), jObjects[0]["value"]["foo"]);
        }


        private void VerifyLog(LogLevel expectedLevel, string expected)
        {
            LoggerMock.Verify(l => l.Log(
                It.Is<LogLevel>(level => level == expectedLevel),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString() == expected),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)));
        }
    }
}

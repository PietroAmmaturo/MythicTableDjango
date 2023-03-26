using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using Mongo2Go;
using MongoDB.Bson;
using MongoDB.Driver;
using Moq;
using MythicTable.Profile.Data;
using MythicTable.Profile.Exceptions;
using Xunit;

namespace MythicTable.Integration.Tests.Profile.Data
{
    public class MongoDbProfileProviderTest : IAsyncLifetime
    {
        private const string UserId = "test-user";
        private const string SecondUserId = "other-user";

        private MemoryCache cache;

        private MongoDbProfileProvider provider;
        protected MongoDbProfileProvider Provider => provider;

        private Mock<ILogger<MongoDbProfileProvider>> loggerMock;
        protected Mock<ILogger<MongoDbProfileProvider>> LoggerMock => loggerMock;

        private MongoDbRunner runner;

        public Task InitializeAsync()
        {
            cache = new MemoryCache(new MemoryCacheOptions());
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"
            };
            var client = new MongoClient(settings.ConnectionString);
            loggerMock = new Mock<ILogger<MongoDbProfileProvider>>();
            provider = new MongoDbProfileProvider(settings, client, LoggerMock.Object, cache);
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            runner.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task CreatesAssignsId()
        {
            var profile = await Provider.Create(new ProfileDto(), UserId);
            Assert.NotNull(profile.Id);
            Assert.Equal(UserId, profile.UserId);
        }

        [Fact]
        public async Task CreatesGeneratesUniqueId()
        {
            var profile1 = await Provider.Create(new ProfileDto(), UserId);
            var profile2 = await Provider.Create(new ProfileDto(), SecondUserId);
            Assert.NotEqual(profile1.Id, profile2.Id);
        }

        [Fact]
        public async Task NullProfileThrows()
        {
            await Assert.ThrowsAsync<ProfileInvalidException>(() => Provider.Create(null, UserId));
        }

        [Fact]
        public async Task CreatingProfileWithExistingIdThrows()
        {
            var profile1 = await Provider.Create(new ProfileDto(), UserId);
            await Assert.ThrowsAsync<ProfileInvalidException>(() => Provider.Create(profile1, UserId));
        }

        [Fact]
        public async Task GetByMultipleIds()
        {
            var profile1 = await Provider.Create(new ProfileDto(), UserId);
            var profile2 = await Provider.Create(new ProfileDto(), SecondUserId);
            var results = await Provider.Get(new string[] { profile1.Id, profile2.Id });
            Assert.Equal(2, results.Count);
        }

        [Fact]
        public async Task CanUpdate()
        {
            var profile = await Provider.Create(new ProfileDto(), UserId);
            profile.DisplayName = "new name";
            profile = await Provider.Update(profile);
            var results = await Provider.Get(profile.Id);
            Assert.Equal("new name", profile.DisplayName);
        }

        [Fact]
        public async Task CanDelete()
        {
            var profile = await Provider.Create(new ProfileDto(), UserId);
            await Provider.Delete(profile.Id);
            await Assert.ThrowsAsync<ProfileNotFoundException>(() => Provider.Get(profile.Id));
        }

        [Fact]
        public async Task GetThrowsWhenProfileNotFound()
        {
            var id = ObjectId.GenerateNewId().ToString();
            var exception = await Assert.ThrowsAsync<ProfileNotFoundException>(() => Provider.Get(id));
            Assert.Equal($"Cannot find user: {id}", exception.Message);
            VerifyLog(LogLevel.Error, $"Cannot find user: {id}");
        }

        [Fact]
        public async Task FailedDeleteLogsTheFailure()
        {
            var id = ObjectId.GenerateNewId().ToString();
            var exception = await Assert.ThrowsAsync<ProfileNotFoundException>(() => Provider.Delete(id));
            Assert.Equal($"Unable to delete profile: {id}", exception.Message);
            VerifyLog(LogLevel.Error, $"Unable to delete profile: {id}");
        }

        [Fact]
        public async Task FailedUpdateLogsTheFailure()
        {
            var exception = await Assert.ThrowsAsync<ProfileInvalidException>(() => Provider.Update(null));
            Assert.Equal("The profile is null", exception.Message);
            VerifyLog(LogLevel.Error, "The profile is null");
        }

        [Fact]
        public async Task UpdateRequiresProfileWithUserId()
        {
            var exception = await Assert.ThrowsAsync<ProfileInvalidException>(() => Provider.Update(new ProfileDto()));
            Assert.Equal("The profile MUST have an id", exception.Message);
            VerifyLog(LogLevel.Error, "The profile MUST have an id");
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

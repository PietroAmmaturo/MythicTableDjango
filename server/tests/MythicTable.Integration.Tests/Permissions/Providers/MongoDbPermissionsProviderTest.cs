using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Mongo2Go;
using MongoDB.Driver;
using Moq;
using MythicTable.Permissions.Data;
using MythicTable.Permissions.Exceptions;
using MythicTable.Permissions.Providers;
using Xunit;

namespace MythicTable.Integration.Tests.Permissions.Providers
{
    public class MongoDbPermissionsProviderTest : IAsyncLifetime
    {
        private const string CampaignId = "012345678901234567890122";
        private const string ObjectId = "012345678901234567890123";
        private const string MissingId = "012345678901234567890124";

        private MongoDbRunner runner;
        public Mock<ILogger<MongoDbPermissionsProvider>> LoggerMock;
        private IPermissionsProvider provider;

        public Task InitializeAsync()
        {
            LoggerMock = new Mock<ILogger<MongoDbPermissionsProvider>>();
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings 
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"
            };
            var client = new MongoClient(settings.ConnectionString);
            provider = new MongoDbPermissionsProvider(settings, client, LoggerMock.Object);
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
            var permissionsDtos = await provider.GetList(CampaignId);
            Assert.Empty(permissionsDtos);
        }

        [Fact]
        public async Task CreatesAndGetsPermissionsDto()
        {
            var createdDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            var permissionsDto = await provider.Get(CampaignId, ObjectId);
            Assert.Equal(createdDto.Id, permissionsDto.Id);
        }

        [Fact]
        public async Task CreatesAndGetListPermissionsDto()
        {
            await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            var permissionsDtos = await provider.GetList(CampaignId);
            Assert.Single(permissionsDtos);
        }

        [Fact]
        public async Task CreatesRequiresValidCampaign()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Create("", ObjectId, new PermissionsDto()));

            var expected = $"Could not create permission invalid campaign ''";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task CreatesRequiresNotNullCampaign()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Create(null, ObjectId, new PermissionsDto()));

            var expected = $"Could not create permission invalid campaign 'null'";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task CreatesRequiresValidObject()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Create(CampaignId, "", new PermissionsDto()));

            var expected = $"Could not create permission invalid object id ''";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task CreatesRequiresNotNullObject()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Create(CampaignId, null, new PermissionsDto()));

            var expected = $"Could not create permission invalid object id 'null'";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task CreatesGeneratesId()
        {
            var permissionsDtos = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            var allPermissions = await provider.GetList(CampaignId);
            Assert.Single(allPermissions);
            Assert.NotNull(permissionsDtos.Id);
            Assert.Equal(permissionsDtos.Id, allPermissions[0].Id);
        }

        [Fact]
        public async Task CreatesGeneratesUniqueId()
        {
            var permissions1 = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            var permissions2 = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            Assert.NotEqual(permissions1.Id, permissions2.Id);
        }

        [Fact]
        public async Task PermissionsDtoTypesAreExcluse()
        {
            await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            var allPermissions = await provider.GetList("other-type");
            Assert.Empty(allPermissions);
        }

        [Fact]
        public async Task CanDelete()
        {
            var permissionsDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            var allPermissions = await provider.GetList(CampaignId);
            Assert.Single(allPermissions);
            var numDeleted = await provider.Delete(CampaignId, permissionsDto.Id);
            Assert.Equal(1, numDeleted);
            allPermissions = await provider.GetList(CampaignId);
            Assert.Empty(allPermissions);
        }

        [Fact]
        public async Task DeleteFromWrongCampaignFailsToDelete()
        {
            var permissionsDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            var allPermissions = await provider.GetList(CampaignId);
            Assert.Single(allPermissions);

            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Delete("wrong-campaign", permissionsDto.Id));

            string expected = $"Could not delete permission '{permissionsDto.Id}' in campaign 'wrong-campaign'";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task UpdatesPermissionsDto()
        {
            var permissionsDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            await provider.GetList(CampaignId);

            permissionsDto.IsPublic = true;
            var numUpdated = await provider.Update(CampaignId, permissionsDto);

            Assert.Equal(1, numUpdated);
            var allPermissions = await provider.GetList(CampaignId);
            Assert.Single(allPermissions);
            Assert.True(allPermissions[0].IsPublic);
        }

        [Fact]
        public async Task UpdatesByAddingUsers()
        {
            var permissionsDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            await provider.GetList(CampaignId);
            
            permissionsDto.Permitted.Add("user01");

            var numUpdated = await provider.Update(CampaignId, permissionsDto);

            Assert.Equal(1, numUpdated);
            var allPermissions = await provider.GetList(CampaignId);
            Assert.Single(allPermissions);
            Assert.Single(allPermissions[0].Permitted);
            Assert.Equal("user01", allPermissions[0].Permitted[0]);
        }

        [Fact]
        public async Task UpdatesByRemovingUsers()
        {
            var permissionsDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto()
            {
                Permitted = new List<string>()
                {
                    "deletedUser",
                    "remainingUser"
                }
            });

            permissionsDto.Permitted.Remove("deletedUser");

            var numUpdated = await provider.Update(CampaignId, permissionsDto);

            Assert.Equal(1, numUpdated);
            var allPermissions = await provider.GetList(CampaignId);
            Assert.Single(allPermissions);
            Assert.Single(allPermissions[0].Permitted);
            Assert.Equal("remainingUser", allPermissions[0].Permitted[0]);
        }

        [Fact]
        public async Task GetThrowsWhenNoPermissionsFound()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Get(CampaignId, ObjectId));

            string expected = $"Could not find permission for item '{ObjectId}' in campaign '{CampaignId}'";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task FailedDeleteLogsTheFailure()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Delete(CampaignId, MissingId));

            string expected = $"Could not delete permission '{MissingId}' in campaign '{CampaignId}'";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task RecordsObjectId()
        {
            var permissionsDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            Assert.Equal(ObjectId, permissionsDto.Object);
        }

        [Fact]
        public async Task RecordsCampaign()
        {
            var permissionsDto = await provider.Create(CampaignId, ObjectId, new PermissionsDto());
            Assert.Equal(CampaignId, permissionsDto.Campaign);
        }

        [Fact]
        public async Task UpdateRequiresId()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Update(CampaignId, new PermissionsDto()));

            string expected = "Could not update permission. Missing Id.";
            Assert.Equal(expected, exception.Message);
            VerifyLog(LogLevel.Error, expected);
        }

        [Fact]
        public async Task FailedUpdateLogsTheFailure()
        {
            var dto = new PermissionsDto()
            {
                Id = MissingId
            };
            var numUpdated = await provider.Update(CampaignId, dto);

            Assert.Equal(0, numUpdated);
            var expected = $"Could not update permission for item '{MissingId}' in campaign '{CampaignId}'";
            VerifyLog(LogLevel.Warning, expected);
        }

        [Fact]
        public async Task IsAuthorizedReturnTrueWhenNoPermissionsFound()
        {
            var exception = await Assert.ThrowsAsync<PermissionException>(() => provider.Get(CampaignId, ObjectId));

            Assert.True(await provider.IsAuthorized("user01", CampaignId, ObjectId));
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

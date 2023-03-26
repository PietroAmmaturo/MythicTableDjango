using Mongo2Go;
using MongoDB.Driver;
using MythicTable.Files.Controllers;
using MythicTable.Files.Data;
using MythicTable.Files.Exceptions;
using System.Threading.Tasks;
using MythicTable.Common.Exceptions;
using Xunit;

namespace MythicTable.Integration.Tests.Files.Data
{
    public class MongoDbFileOwnershipProviderTests: IAsyncLifetime
    {
        private MongoDbRunner runner;
        public IFileOwnershipProvider provider;

        public Task InitializeAsync()
        {
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"
            };
            var client = new MongoClient(settings.ConnectionString);
            provider = new MongoDbFileOwnershipProvider(settings, client);
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            runner.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task TestCreateAndGet()
        {
            var createdDto = await Create("map", "file", "user");
            var fetchedDto = await provider.Get(createdDto.Id, "user");
            Assert.Equal(createdDto.Id, fetchedDto.Id);
            Assert.Equal(createdDto.Reference, fetchedDto.Reference);
        }

        [Fact]
        public async Task TestGetNonExistentThrows()
        {
            var exception = await Assert.ThrowsAsync<FileStorageException>(
                () => provider.Get("5515836e58c7b4fbc756320b", "user"));
            Assert.Equal("Could not find File of Id: '5515836e58c7b4fbc756320b'", exception.Message);
        }

        [Fact]
        public async Task TestGetWithWrongUserThrows()
        {
            var createdDto = await Create("map", "file", "user");
            var exception = await Assert.ThrowsAsync<FileStorageException>(
                () => provider.Get(createdDto.Id, "user2"));
            Assert.Equal($"File '{createdDto.Id}' does not belong to user 'user2'", exception.Message);
        }

        [Fact]
        public async Task TestDeleteNonExistentThrows()
        {
            var exception = await Assert.ThrowsAsync<FileStorageException>(
                () => provider.Delete("5515836e58c7b4fbc756320b", "user"));
            Assert.Equal("Could not find File of Id: '5515836e58c7b4fbc756320b'", exception.Message);
        }

        [Fact]
        public async Task TestDeleteWithWrongUserThrows()
        {
            var createdDto = await Create("map", "file", "user");
            var exception = await Assert.ThrowsAsync<FileStorageException>(
                () => provider.Delete(createdDto.Id, "user2"));
            Assert.Equal($"File '{createdDto.Id}' does not belong to user 'user2'", exception.Message);
        }

        [Fact]
        public async Task TestDeleteRemovesTheFile()
        {
            var createdDto = await Create("map", "file", "user");
            await provider.Delete(createdDto.Id, "user");
            var exception = await Assert.ThrowsAsync<FileStorageException>(
                () => provider.Get(createdDto.Id, "user"));
            Assert.Equal($"Could not find File of Id: '{createdDto.Id}'", exception.Message);
        }

        [Fact]
        public async Task TestCreateAndGetAll()
        {
            await Create("map", "file1", "user");
            await Create("map", "file2", "user");
            var all = await provider.GetAll("user");
            Assert.Equal(2, all.Count);
        }

        [Fact]
        public async Task TestBlankFilterReturnsAllFiles()
        {
            await Create("map", "file1", "user");
            await Create("map", "file2", "user");
            var all = await provider.Filter("user", new FileFilter());
            Assert.Equal(2, all.Count);
        }

        [Fact]
        public async Task TestFilterReturnsOnlyReleventFiles()
        {
            await Create("map", "file1", "user");
            await Create("character", "file1", "user");
            await Create("character", "file2", "user");
            await Create("character", "file3", "user2");
            var all = await provider.Filter("user", new FileFilter { Path = "character"} );
            Assert.Equal(2, all.Count);
            Assert.Equal("character", all[0].Path);
            Assert.Equal("file1", all[0].Name);
            Assert.Equal("user", all[0].User);
            Assert.Equal("file1", all[0].Reference);
            Assert.Equal("character", all[1].Path);
            Assert.Equal("file2", all[1].Name);
            Assert.Equal("user", all[1].User);
            Assert.Equal("file2", all[1].Reference);
        }

        [Fact]
        public async Task TestStoreAddsId()
        {
            var dto = new FileDto
            {
                Reference = "",
                User = "user"
            };
            Assert.Null(dto.Id);
            dto = await provider.Create(dto);
            Assert.NotNull(dto.Id);
        }

        [Fact]
        public async Task TestThrowsCannotFindWhenIdIsNotObjectId()
        {
            var exception = await Assert.ThrowsAsync<MythicTableException>(
                () => provider.Get("1", "user"));
            Assert.Equal($"Could not parse Id: '1'", exception.Message);
        }

        private async Task<FileDto> Create(string path, string resource, string user)
        {
            var dto = new FileDto
            {
                Path = path,
                Name = resource,
                Reference = resource,
                User = user                
            };
            Assert.Null(dto.Id);
            dto = await provider.Create(dto);
            Assert.NotNull(dto.Id);
            return dto;
        }
    }
}

using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Mongo2Go;
using MongoDB.Driver;
using Moq;
using MythicTable.Files.Controllers;
using MythicTable.Files.Data;
using MythicTable.Files.Store;
using MythicTable.Profile.Data;
using MythicTable.TestUtils.Files;
using MythicTable.TestUtils.Profile.Util;
using Xunit;

namespace MythicTable.Integration.Tests.Files.Controllers
{
    public class FileControllerMd5Tests: IAsyncLifetime
    {
        private FileController controller;
        private Mock<IProfileProvider> profileProvider;
        private MongoDbRunner runner;
        private IFileOwnershipProvider fileOwnershipProvider;

        private string User { get; set; } = "TestUser";
        private ProfileDto Profile { get; set; }
        
        public Task InitializeAsync()
        {
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var settings = new MongoDbSettings
            {
                ConnectionString = runner.ConnectionString,
                DatabaseName = "mythictable"
            };
            var client = new MongoClient(settings.ConnectionString);
            fileOwnershipProvider = new MongoDbFileOwnershipProvider(settings, client);

            profileProvider = new Mock<IProfileProvider>();
            Profile = ProfileTestUtil.CreateProfile(profileProvider, User);

            var store = new LocalFileStore(Path.GetTempPath(), new FileWriter());
            controller = new FileController(fileOwnershipProvider, store, profileProvider.Object, new MemoryCache(new MemoryCacheOptions()));
            var mockHttpContext = new Mock<HttpContext>();
            mockHttpContext.Setup(hc => hc.User.FindFirst(It.IsAny<string>()))
                .Returns(() => new Claim("", User));
            controller.ControllerContext.HttpContext = mockHttpContext.Object;

            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            runner.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task TestPostDuplicatesResultsInTheSameUrl()
        {
            IFormFile file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("blank")), 0, 5, "Data", "dummy.txt");
            var fileCollection = new FormFileCollection { file };


            var firstFile = await FileControllerTestHelper.PostFile(fileCollection, controller);
            var secondFile = await FileControllerTestHelper.PostFile(fileCollection, controller);
            Assert.NotEqual(secondFile.Id, firstFile.Id);
            Assert.Equal(secondFile.Md5, firstFile.Md5);
            Assert.Equal(secondFile.Url, firstFile.Url);
        }

        [Fact]
        public async Task TestDeleteDuplicateFilesIsSafe()
        {
            IFormFile file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("blank")), 0, 5, "Data", "dummy.txt");
            var fileCollection = new FormFileCollection { file };


            var firstFile = await FileControllerTestHelper.PostFile(fileCollection, controller);
            var secondFile = await FileControllerTestHelper.PostFile(fileCollection, controller);

            Assert.True(File.Exists(firstFile.Reference));
            Assert.True(File.Exists(secondFile.Reference));

            await controller.DeleteFile(new List<string> { firstFile.Id });

            Assert.True(File.Exists(secondFile.Reference));
            
            await controller.DeleteFile(new List<string> { secondFile.Id });

            Assert.False(File.Exists(firstFile.Reference));
            Assert.False(File.Exists(secondFile.Reference));
        }
    }
}

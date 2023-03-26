using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MythicTable.Files.Controllers;
using MythicTable.Files.Data;
using MythicTable.Files.Store;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using MythicTable.Profile.Data;
using MythicTable.TestUtils.Files;
using MythicTable.TestUtils.Profile.Util;
using Xunit;

namespace MythicTable.Tests.Files.Controllers
{
    public class FileControllerTests
    {
        private readonly FileController controller;
        private readonly Mock<IFileOwnershipProvider> mockProvider;
        private readonly Mock<IFileStore> mockStore;
        private readonly Mock<IProfileProvider> profileProvider;

        private string User { get; set; } = "TestUser";
        private ProfileDto Profile { get; set; }

        public FileControllerTests()
        {
            mockProvider = new Mock<IFileOwnershipProvider>();
            mockStore = new Mock<IFileStore>();
            profileProvider = new Mock<IProfileProvider>();
            Profile = ProfileTestUtil.CreateProfile(profileProvider, User);

            controller = new FileController(mockProvider.Object, mockStore.Object, profileProvider.Object, new MemoryCache(new MemoryCacheOptions()));
            var mockHttpContext = new Mock<HttpContext>();
            mockHttpContext.Setup(hc => hc.User.FindFirst(It.IsAny<string>()))
                           .Returns(() => new Claim("", User));
            controller.ControllerContext.HttpContext = mockHttpContext.Object;
        }

        [Fact]
        public async Task TestGetsEmptyList()
        {
            mockProvider.Setup(provider => provider.GetAll(It.IsAny<string>()))
                .ReturnsAsync(new List<FileDto>());

            var actionResult = await controller.GetFiles() as ActionResult<List<FileDto>>;
            var files = actionResult.Value as List<FileDto>;
            Assert.Empty(files);
        }

        [Fact]
        public async Task TestGetFiles()
        {
            List<FileDto> mockFiles = new List<FileDto>
            {
                new FileDto(),
                new FileDto(),
            };
            mockProvider.Setup(provider => provider.GetAll(It.IsAny<string>()))
                .ReturnsAsync(mockFiles);

            var actionResult = await controller.GetFiles() as ActionResult<List<FileDto>>;
            var files = actionResult.Value as List<FileDto>;
            Assert.Equal(2, files.Count);
        }

        [Fact]
        public async Task TestBlankFilterReturnsAllFiles()
        {
            List<FileDto> mockFiles = new List<FileDto>
            {
                new FileDto(),
                new FileDto(),
            };
            mockProvider.Setup(provider => provider.GetAll(It.IsAny<string>()))
                .ReturnsAsync(mockFiles);
            mockProvider.Setup(provider => provider.Filter(It.IsAny<string>(), It.IsAny<FileFilter>()));

            var actionResult = await controller.GetFiles(path: null) as ActionResult<List<FileDto>>;
            var files = actionResult.Value as List<FileDto>;
            Assert.Equal(2, files.Count);
            mockProvider.Verify(provider => provider.Filter(It.IsAny<string>(), It.IsAny<FileFilter>()),
                Times.Never());
        }

        [Fact]
        public async Task TestGetSingleFile()
        {
            const string Id = "file-id";
            mockProvider.Setup(provider => provider.Get(Id, Profile.Id))
                .ReturnsAsync(new FileDto { Id = Id });

            var actionResult = await controller.GetFile(Id) as ActionResult<FileDto>;
            var file = actionResult.Value as FileDto;
            Assert.Equal(Id, file.Id);
        }

        [Fact]
        public async Task TestPostFile()
        {
            mockProvider.Setup(provider => provider.Create(It.IsAny<FileDto>()))
                .ReturnsAsync((FileDto dto) => dto);
            mockStore.Setup(store => store.SaveFile(It.IsAny<IFormFile>(), It.IsAny<string>()))
                .ReturnsAsync(new FileDto { Reference = "file-path" });

            IFormFile file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("blank")), 0, 5, "Data", "dummy.txt");
            var fileCollection = new FormFileCollection {file};

            var fileResults = await FileControllerTestHelper.PostFile(fileCollection, controller);
            Assert.Equal("file-path", fileResults.Reference);
            Assert.Equal("dummy.txt", fileResults.Name);

            mockStore.Verify(store => store.SaveFile(It.Is<IFormFile>(
                form => form.Name == "Data" && form.FileName == "dummy.txt"),
                It.IsAny<string>()));
            mockProvider.Verify(provider => provider.Create(
                It.Is<FileDto>( f => f.Reference == "file-path" && f.User == Profile.Id)
            ));
        }

        [Fact]
        public async Task TestDeleteFile()
        {
            const string Id = "file-id";
            mockProvider.Setup(provider => provider.Get(Id, Profile.Id))
                .ReturnsAsync(new FileDto { Id = Id });
            mockProvider.Setup(provider => provider.Delete(Id, Profile.Id))
                .ReturnsAsync(new FileDto { Id = Id });
            mockStore.Setup(store => store.DeleteFiles(It.IsAny<List<FileDto>>()));

            var actionResult = await controller.DeleteFile(new List<string>{ Id }) as ActionResult<DeleteResult>;
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var results = Assert.IsType<DeleteResult>(okResult.Value);
            Assert.Equal(1, results.Count);
            Assert.Single(results.Ids);
            Assert.Equal(Id, results.Ids.Single());

            mockStore.Verify(store => store.DeleteFiles(It.Is<List<FileDto>>(
                files => files.Single().Id == Id)));
        }
    }
}

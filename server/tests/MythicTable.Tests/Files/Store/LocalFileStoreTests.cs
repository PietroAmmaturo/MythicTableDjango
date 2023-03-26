using Microsoft.AspNetCore.Http;
using Moq;
using MythicTable.Files.Data;
using MythicTable.Files.Store;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace MythicTable.Tests.Files.Store
{
    public class LocalFileStoreTests
    {
        private Mock<IFileWriter> mockWriter;
        private IFormFile file;
        private LocalFileStore store;

        public LocalFileStoreTests()
        {
            mockWriter = new Mock<IFileWriter>();
            file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("data")), 0, 5, "Data", "dummy.txt");
            store = new LocalFileStore("", mockWriter.Object);
        }

        [Fact]
        public void TestConstructorDoesntCreateDirectory()
        {
            var localMock = new Mock<IFileWriter>();
            localMock.Setup(w => w.CreateDirectory(It.IsAny<string>()))
                .Throws(new Exception("Shouldn't be called."));

            _ = new LocalFileStore("", localMock.Object);
        }

        [Fact]
        public async Task TestWritingFileCreatesDirectory()
        {
            mockWriter.Setup(w => w.CreateDirectory(""));

            var store = new LocalFileStore("", mockWriter.Object);
            await store.SaveFile(file, "");

            mockWriter.Verify(w => w.CreateDirectory(It.IsAny<string>()));
        }

        [Fact]
        public async Task TestDeleteFiles()
        {
            mockWriter.Setup(w => w.DeleteFiles(It.IsAny<List<string>>()));

            var store = new LocalFileStore("", mockWriter.Object);
            await store.DeleteFiles(new List<FileDto> { new FileDto { Reference = "test-file" } });

            mockWriter.Verify(w => w.DeleteFiles(
                It.Is<List<string>>(paths => paths.Contains("test-file"))
            ));
        }

        [Fact]
        public async Task TestBuildsUrlsFromPath()
        {
            var store = new LocalFileStore("", mockWriter.Object, "http://localhost:5000/assets/");
            var dto = await store.SaveFile(file, "");

            Assert.Equal($"http://localhost:5000/assets/{dto.Reference}", dto.Url);
        }
    }
}

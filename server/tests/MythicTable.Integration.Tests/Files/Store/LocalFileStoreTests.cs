using Microsoft.AspNetCore.Http;
using MythicTable.Files.Data;
using MythicTable.Files.Store;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace MythicTable.Integration.Tests.Files.Store
{
    public class LocalFileStoreIntegrationTests
    {
        [Fact]
        public async Task TestSaveFileCreatesFileAtPath()
        {
            string path = $"{Path.GetTempPath()}{GetType()}";
            var store = new LocalFileStore(path, new FileWriter());
            IFormFile file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("data")), 0, 5, "Data", "dummy.txt");
            var results = await store.SaveFile(file, "");
            Assert.Contains(path, results.Reference);
            Assert.True(File.Exists(results.Reference));
        }

        [Fact]
        public async Task TestDeleteFileRemovesFile()
        {
            string path = $"{Path.GetTempPath()}{GetType()}";
            var store = new LocalFileStore(path, new FileWriter());
            IFormFile file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("data")), 0, 5, "Data", "dummy.txt");
            var results = await store.SaveFile(file, "");
            Assert.Contains(path, results.Reference);
            Assert.True(File.Exists(results.Reference));

            await store.DeleteFiles(new List<FileDto> { results });
        }
        [Fact]
        public async Task TestSaveFilePreservesFileExtensions()
        {
            string path = $"{Path.GetTempPath()}{GetType()}";
            var store = new LocalFileStore(path, new FileWriter());
            IFormFile file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("data")), 0, 5, "Data", "dummy.png");
            var results = await store.SaveFile(file, "");
            Assert.EndsWith(".png", results.Reference);
        }
    }
}

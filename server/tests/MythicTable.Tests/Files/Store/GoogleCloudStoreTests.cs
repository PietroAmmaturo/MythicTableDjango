using System;
using Microsoft.Extensions.Configuration;
using MythicTable.Files.Store;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Google.Apis.Upload;
using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Http;
using Moq;
using MythicTable.Files.Data;
using Xunit;

namespace MythicTable.Tests.Files.Store
{
    public class GoogleCloudStoreTests
    {
        private GoogleCloudStore store;
        private Mock<StorageClient> storageClient;

        public GoogleCloudStoreTests()
        {
            var config = new Dictionary<string, string>
            {
                {"MTT_GCP_BUCKET_IMAGES", "bucketName"}
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(config)
                .Build();

            storageClient = new Mock<StorageClient>();
            storageClient.Setup(client => client.UploadObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<MemoryStream>(),
                It.IsAny<UploadObjectOptions>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<IProgress<IUploadProgress>>()
                )).ReturnsAsync(new Google.Apis.Storage.v1.Data.Object(){ Id = "id" });
            storageClient.Setup(client => client.DeleteObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<DeleteObjectOptions>(),
                It.IsAny<CancellationToken>()
            ));

            store = new GoogleCloudStore(storageClient.Object, configuration);
        }

        [Fact]
        public async Task SaveFileShouldUploadObject()
        {
            IFormFile file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("data")), 0, 5, "Data", "dummy.txt");
            await store.SaveFile(file, "userId");

            storageClient.Verify(client => client.UploadObjectAsync(
                It.Is<string>(value => value == "bucketName"),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<MemoryStream>(),
                It.IsAny<UploadObjectOptions>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<IProgress<IUploadProgress>>()
            ));
        }

        [Fact]
        public async Task DeleteFilesShouldDeleteObjectAsync()
        {
            var files = new List<FileDto> {new FileDto {Url = "/here/file"}};
            await store.DeleteFiles(files);

            storageClient.Verify(client => client.DeleteObjectAsync(
                It.Is<string>(value => value == "bucketName"),
                It.IsAny<string>(),
                It.IsAny<DeleteObjectOptions>(),
                It.IsAny<CancellationToken>()
            ));
        }
    }
}

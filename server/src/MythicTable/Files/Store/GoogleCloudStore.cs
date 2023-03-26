using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MythicTable.Files.Data;
using MythicTable.Files.Util;

namespace MythicTable.Files.Store
{
    public class GoogleCloudStore : IFileStore
    {
        private readonly StorageClient storageClient;
        private readonly string bucketName;

        public GoogleCloudStore(StorageClient storageClient, IConfiguration configuration)
        {
            this.storageClient = storageClient;
            bucketName = configuration.GetValue<string>("MTT_GCP_BUCKET_IMAGES");
        }

        public async Task<FileDto> SaveFile(IFormFile formFile, string userId)
        {
            var fileName = FileUtil.CreateRandomFileName(formFile.FileName, userId, DateTime.UtcNow);
            await using var memoryStream = new MemoryStream();
            await formFile.CopyToAsync(memoryStream);
            var dataObject = await storageClient.UploadObjectAsync(bucketName, fileName, null, memoryStream);
            return new FileDto
            {
                Reference = dataObject.Id,
                Url = $"https://storage.googleapis.com/{bucketName}/{fileName}"
            };
        }

        public async Task DeleteFiles(List<FileDto> files)
        {
            var tasks = new List<Task>();
            foreach (var file in files)
            {
                tasks.Add(storageClient.DeleteObjectAsync(bucketName, file.Url));
            }
            await Task.WhenAll(tasks);
        }
    }
}

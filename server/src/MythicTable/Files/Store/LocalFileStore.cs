using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using MythicTable.Files.Data;
using MythicTable.Files.Util;

namespace MythicTable.Files.Store
{
    public class LocalFileStore : IFileStore
    {
        private string path;
        private IFileWriter writer;
        private string urlPrefix;

        public LocalFileStore(string path, IFileWriter writer, string urlPrefix = "/")
        {
            this.path = path;
            this.writer = writer;
            this.urlPrefix = urlPrefix;
        }

        public async Task<FileDto> SaveFile(IFormFile formFile, string userId)
        {
            string fileName = FileUtil.CreateRandomFileName(formFile.FileName, userId, DateTime.UtcNow);
            var filePath = Path.Join(this.path, fileName);
            writer.CreateDirectory(Path.GetDirectoryName(filePath));
            string path = await writer.CopyToFile(formFile, filePath);
            return new FileDto
            {
                Reference = filePath,
                Url = urlPrefix + fileName
            };
        }

        public Task DeleteFiles(List<FileDto> files)
        {
            return writer.DeleteFiles(files.Select(f => f.Reference).ToList());
        }
    }
}

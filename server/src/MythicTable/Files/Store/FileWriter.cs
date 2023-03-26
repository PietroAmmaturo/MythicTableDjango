using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace MythicTable.Files.Store
{
    public class FileWriter : IFileWriter
    {
        public void CreateDirectory(string path)
        {
            Directory.CreateDirectory(path);
        }

        public async Task<string> CopyToFile(IFormFile formFile, string filePath)
        {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await formFile.CopyToAsync(stream);
            }
            return filePath;
        }

        public Task DeleteFiles(List<string> filePaths)
        {
            foreach (var path in filePaths)
            {
                File.Delete(path);
            }
            return Task.CompletedTask;
        }
    }
}
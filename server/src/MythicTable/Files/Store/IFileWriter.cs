using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MythicTable.Files.Store
{
    public interface IFileWriter
    {
        void CreateDirectory(string path);
        Task<string> CopyToFile(IFormFile formFile, string filePath);
        Task DeleteFiles(List<string> filePaths);
    }
}
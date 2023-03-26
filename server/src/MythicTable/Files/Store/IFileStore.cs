using Microsoft.AspNetCore.Http;
using MythicTable.Files.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MythicTable.Files.Store
{
    public interface IFileStore
    {
        Task<FileDto> SaveFile(IFormFile formFile, string userId);
        Task DeleteFiles(List<FileDto> filePaths);
    }
}

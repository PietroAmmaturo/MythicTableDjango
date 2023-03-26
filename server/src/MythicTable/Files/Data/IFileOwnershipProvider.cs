using Microsoft.AspNetCore.Mvc;
using MythicTable.Files.Controllers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MythicTable.Files.Data
{
    public interface IFileOwnershipProvider
    {
        Task<List<FileDto>> GetAll(string userId);
        Task<List<FileDto>> Filter(string userId, FileFilter filter);
        Task<FileDto> Get(string id, string userId);
        Task<FileDto> Delete(string id, string userId);
        Task<FileDto> Create(FileDto dto);
        Task<FileDto> FindDuplicate(string user, string md5);
    }
}

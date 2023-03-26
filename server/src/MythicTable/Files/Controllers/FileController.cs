using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MythicTable.Common.Controllers;
using MythicTable.Files.Data;
using MythicTable.Files.Store;
using MythicTable.Profile.Data;

namespace MythicTable.Files.Controllers
{
    [Route("api/files")]
    [ApiController]
    [Authorize]
    public class FileController : AuthorizedController

    {
        private readonly IFileOwnershipProvider provider;
        private readonly IFileStore fileStore;

        public FileController(IFileOwnershipProvider provider, IFileStore fileStore, IProfileProvider profileProvider, IMemoryCache cache) : base(profileProvider, cache)
        {
            this.provider = provider ?? throw new ArgumentNullException(nameof(provider));
            this.fileStore = fileStore ?? throw new ArgumentNullException(nameof(fileStore));
        }

        // GET: api/files
        [HttpGet]
        public async Task<ActionResult<List<FileDto>>> GetFiles(string path = null)
        {
            if (string.IsNullOrEmpty(path))
            {
                return await provider.GetAll(await this.GetProfileId());
            }
            return await provider.Filter(await this.GetProfileId(), new FileFilter { Path = path });
        }

        // GET: api/files/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FileDto>> GetFile(string id)
        {
            return await provider.Get(id, await this.GetProfileId());
        }

        // POST: api/files
        [HttpPost]
        public async Task<ActionResult<UploadResult>> PostFile(IFormFileCollection files, string path = "")
        {
            var size = files.Sum(f => f.Length);
            var user = await this.GetProfileId();

            var dtos = new List<FileDto>();
            foreach (var formFile in files)
            {
                if (formFile.Length <= 0) continue;

                var md5 = CalculateMd5(formFile.OpenReadStream());

                var existingFile = await provider.FindDuplicate(user, md5);

                FileDto dto = null;
                if (existingFile != null)
                {
                    dto = new FileDto {Reference = existingFile.Reference, Url = existingFile.Url};
                }
                else
                {
                    dto = await this.fileStore.SaveFile(formFile, user);
                }
                dto.User = user;
                dto.Path = path;
                dto.Name = formFile.FileName;
                dto.Md5 = md5;
                dtos.Add(await provider.Create(dto));
            }
            return Ok(new UploadResult { Count = files.Count, Size = size, Files = dtos });
        }

        // DELETE: api/file/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<DeleteResult>> DeleteFile(List<string> ids)
        {
            var user = await this.GetProfileId();
            var filesToDelete = new List<FileDto>();
            var filesFound = new List<FileDto>();
            foreach (var id in ids)
            {
                var file = await provider.Get(id, user);
                await provider.Delete(id, user);
                filesFound.Add(file);

                if (await provider.FindDuplicate(file.User, file.Md5) == null)
                {
                    filesToDelete.Add(file);
                }
            }

            await fileStore.DeleteFiles(filesToDelete);
            return Ok(new DeleteResult { Count = filesToDelete.Count, Ids = filesFound.Select(f => f.Id).ToList() });
        }

        private static string CalculateMd5(Stream stream)
        {
            using var md5 = MD5.Create();
            return Convert.ToBase64String(md5.ComputeHash(stream));
        }
    }
}

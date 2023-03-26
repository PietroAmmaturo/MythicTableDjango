using MongoDB.Driver;
using MythicTable.Files.Controllers;
using MythicTable.Files.Exceptions;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using MythicTable.Common.Data;

namespace MythicTable.Files.Data
{
    public class MongoDbFileOwnershipProvider : IFileOwnershipProvider
    {
        private readonly IMongoCollection<FileDto> files;

        public MongoDbFileOwnershipProvider(MongoDbSettings settings, IMongoClient client)
        {
            var database = client.GetDatabase(settings.DatabaseName);
            files = database.GetCollection<FileDto>("files");
        }

        public async Task<FileDto> Delete(string id, string userId)
        {
            var dto = await Get(id, userId);
            var filter = Builders<FileDto>.Filter.Eq("Id", id);
            await files.DeleteOneAsync(filter);
            return dto;
        }

        public async Task<FileDto> Get(string id, string userId)
        {
            var filter = Builders<FileDto>.Filter.Eq("Id", MongoDbUtil.MakeObjectId(id));
            var dto = await files.Find(filter).FirstOrDefaultAsync();
            if (dto == null)
            {
                throw new FileStorageException($"Could not find File of Id: '{id}'", HttpStatusCode.NotFound);
            }
            if (dto.User != userId)
            {
                throw new FileStorageException($"File '{id}' does not belong to user '{userId}'", HttpStatusCode.Forbidden);
            }
            return dto;
        }

        public async Task<List<FileDto>> GetAll(string userId)
        {
            var filter = Builders<FileDto>.Filter.Eq("user", userId);
            return await files.Find(filter).ToListAsync();
        }

        public async Task<List<FileDto>> Filter(string userId, FileFilter filter)
        {
            var mongoFilter = Builders<FileDto>.Filter.Eq("user", userId);
            if (filter != null && filter.Path != null && filter.Path != string.Empty)
            {
                mongoFilter =  mongoFilter & (Builders<FileDto>.Filter.Eq("path", filter.Path));
            }
            return await files.Find(mongoFilter).ToListAsync();
        }

        public async Task<FileDto> Create(FileDto dto)
        {
            await files.InsertOneAsync(dto);
            return dto;
        }

        public async Task<FileDto> FindDuplicate(string user, string md5)
        {
            var filter = Builders<FileDto>.Filter.Where(
                data => (data.User == user && data.Md5 == md5));
            return await files.Find(filter).FirstOrDefaultAsync();
        }
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using MythicTable.Profile.Exceptions;
using Microsoft.Extensions.Caching.Memory;

namespace MythicTable.Profile.Data
{
    public class MongoDbProfileProvider : IProfileProvider
    {
        private readonly IMongoCollection<ProfileDto> collection;
        private readonly ILogger<MongoDbProfileProvider> logger;
        private ProfileCache cache;

        public MongoDbProfileProvider(MongoDbSettings settings, IMongoClient client, ILogger<MongoDbProfileProvider> logger, IMemoryCache memCache)
        {
            var database = client.GetDatabase(settings.DatabaseName);
            collection = database.GetCollection<ProfileDto>("profiles");
            this.logger = logger;
            cache = new ProfileCache(this, memCache);
        }

        public async Task<ProfileDto> GetByUserId(string userId)
        {
            var filter = Builders<ProfileDto>.Filter.Eq("UserId", userId);
            var dto = await collection.Find(filter).FirstOrDefaultAsync();
            if (dto != null) return dto;

            var message = $"Cannot find user by id: {userId}";
            logger.LogError(message);
            throw new ProfileNotFoundException(message);
        }

        public async Task<ProfileDto> Get(string id)
        {
            var filter = Builders<ProfileDto>.Filter.Eq("Id", id);
            var dto = await collection.Find(filter).FirstOrDefaultAsync();
            if (dto != null) return dto;
            
            var message = $"Cannot find user: {id}";
            logger.LogError(message);
            throw new ProfileNotFoundException(message);
        }

        public async Task<List<ProfileDto>> Get(string[] ids)
        {
            var profileDtos = new List<ProfileDto>();
            foreach (var id in ids)
            {
                try
                {
                    profileDtos.Add(await Get(id));
                }
                catch (ProfileNotFoundException)
                {
                }
            }

            return profileDtos;
        }

        public async Task<ProfileDto> Create(ProfileDto profile, string userId)
        {
            if (profile == null)
            {
                throw new ProfileInvalidException($"The profile is null");
            }

            if (!string.IsNullOrEmpty(profile.Id))
            {
                throw new ProfileInvalidException($"The profile already has an id");
            }
            profile.UserId = userId;
            await collection.InsertOneAsync(profile);
            return profile;
        }

        public async Task<ProfileDto> Update(ProfileDto profile)
        {
            if (profile == null)
            {
                var message = "The profile is null";
                logger.LogError(message);
                throw new ProfileInvalidException(message);
            }

            if (string.IsNullOrEmpty(profile.Id))
            {
                var message = "The profile MUST have an id";
                logger.LogError(message);
                throw new ProfileInvalidException(message);
            }

            await collection.ReplaceOneAsync(p => p.Id == profile.Id, profile);
            return profile;
        }

        public async Task Delete(string id)
        {
            var results = await collection.DeleteOneAsync(p => p.Id == id);
            if (results.DeletedCount == 0)
            {
                var message = $"Unable to delete profile: {id}";
                logger.LogError(message);
                throw new ProfileNotFoundException(message);
            }
        }
        public Task<string> GetProfileId(string keycloakId)
        {
            return cache.CacheTryGetValueSet(keycloakId);
        }
    }
}

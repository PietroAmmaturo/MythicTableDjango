using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using MythicTable.Permissions.Data;
using MythicTable.Permissions.Exceptions;

namespace MythicTable.Permissions.Providers
{
    public class MongoDbPermissionsProvider : IPermissionsProvider
    {
        private readonly IMongoCollection<PermissionsDto> permissions;
        private readonly ILogger<MongoDbPermissionsProvider> logger;

        public MongoDbPermissionsProvider(MongoDbSettings settings, IMongoClient client, ILogger<MongoDbPermissionsProvider> logger)
        {
            var database = client.GetDatabase(settings.DatabaseName);
            permissions = database.GetCollection<PermissionsDto>("permissions");
            this.logger = logger;
        }

        public async Task<PermissionsDto> Create(string campaignId, string objectId, PermissionsDto permissions)
        {
            if (string.IsNullOrEmpty(campaignId))
            {
                Error($"Could not create permission invalid campaign '{campaignId ?? (object)"null"}'");
            }

            if (string.IsNullOrEmpty(objectId))
            {
                Error($"Could not create permission invalid object id '{objectId ?? (object)"null"}'");
            }

            permissions.Campaign = campaignId;
            permissions.Object = objectId;
            await this.permissions.InsertOneAsync(permissions);
            return permissions;
        }

        private void Error(string msg)
        {
            this.logger.LogError(msg);
            throw new PermissionException(msg);
        }

        public Task<List<PermissionsDto>> GetList(string campaignId)
        {
            var results = permissions.Find(p => p.Campaign == campaignId);
            return results.ToListAsync();
        }

        public async Task<PermissionsDto> Get(string campaignId, string objectId)
        {
            var permission = await permissions.Find<PermissionsDto>(p => p.Campaign == campaignId && p.Object == objectId).FirstOrDefaultAsync();
            if (permission == null)
            {
                Error($"Could not find permission for item '{objectId}' in campaign '{campaignId}'");
            }

            return permission;
        }

        public async Task<long> Update(string campaignId, PermissionsDto permission)
        {
            if (string.IsNullOrEmpty(permission.Id))
            {
                Error("Could not update permission. Missing Id.");
            }

            var results = await permissions.ReplaceOneAsync(p => p.Id == permission.Id && p.Campaign == campaignId, permission);

            if (results.ModifiedCount == 0)
            {
                this.logger.LogWarning($"Could not update permission for item '{permission.Id}' in campaign '{campaignId}'");
            }
            return results.ModifiedCount;
        }

        public async Task<long> Delete(string campaignId, string id)
        {
            var results = await permissions.DeleteOneAsync(p => p.Id == id && p.Campaign == campaignId);
            if (results.DeletedCount == 0)
            {
                Error($"Could not delete permission '{id}' in campaign '{campaignId}'");
            }

            return results.DeletedCount;
        }

        public async Task<bool> IsAuthorized(string userId, string campaignId, string objectId)
        {
            try
            {
                var perms = await this.Get(campaignId, objectId);
                return perms != null;
            }
            catch (PermissionException e)
            {
                return true;
            }
        }
    }
}

using Microsoft.AspNetCore.JsonPatch;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MythicTable.Common.Data;
using MythicTable.Common.Exceptions;
using MythicTable.Common.JsonPatch;
using System;

namespace MythicTable.Collections.Providers
{
    public class MongoDbCollectionProvider : ICollectionProvider
    {
        private const string CollectionField = "_collection";
        private const string UserIdField = "_userid";
        private const string CampaignField = "_campaign";

        private readonly IMongoCollection<BsonDocument> collections;
        private readonly ILogger<MongoDbCollectionProvider> logger;

        private readonly JsonPatchTranslator translator = new JsonPatchTranslator();

        public MongoDbCollectionProvider(MongoDbSettings settings, IMongoClient client, ILogger<MongoDbCollectionProvider> logger)
        {
            var database = client.GetDatabase(settings.DatabaseName);
            collections = database.GetCollection<BsonDocument>("collections");
            this.logger = logger;
        }

        public async Task<JObject> Create(string userId, string collection, JObject jObject)
        {
            var bson = jObject.AsBson();
            bson[UserIdField] = userId;
            bson[CollectionField] = collection;
            await collections.InsertOneAsync(bson);
            return bson.AsJson();
        }

        public async Task<List<JObject>> GetList(string userId, string collectionId)
        {
            var results = await collections.Find(
                data => (data[CollectionField] == collectionId && data[UserIdField] == userId)
                ).ToListAsync();
            if (results != null && results.Count != 0)
            {
                return results.Select(result => result.AsJson()).ToList();
            }
            this.logger.LogError($"Could not find collection '{collectionId}' for user '{userId}'");
            return new List<JObject>();
        }

        public async Task<JObject> Get(string userId, string collectionId, string id)
        {
            try
            {
                var results = await collections.Find(
                    data => (data[CollectionField] == collectionId && data[UserIdField] == userId && data["_id"] == ObjectId.Parse(id))
                ).ToListAsync();
                var bson = results.FirstOrDefault();
                if (bson != null)
                {
                    return bson.AsJson();
                }
            }
            catch
            {
                // ignored
            }

            var message = $"Could not find item '{id}' in collection '{collectionId}' for user '{userId}'";
            this.logger.LogError(message);
            throw new MythicTableException(message);
        }

        public async Task<int> Delete(string userId, string collectionId, string id)
        {
            var results = await collections.DeleteOneAsync(
                data =>
                (
                    data[CollectionField] == collectionId &&
                    data[UserIdField] == userId &&
                    data["_id"] == ObjectId.Parse(id)
                ));
            if (results.DeletedCount == 0)
            {
                this.logger.LogWarning($"Could not delete item '{id}' in collection '{collectionId}' for user '{userId}'");
            }
            return (int)results.DeletedCount;
        }

        public async Task<int> Update(string userId, string collectionId, string id, JsonPatchDocument patch)
        {
            var filter = Builders<BsonDocument>.Filter.Where(
                data => (data[CollectionField] == collectionId && data[UserIdField] == userId && data["_id"] == ObjectId.Parse(id)));
            var updated = await InternalUpdate(patch, filter);
            if (updated == 0)
            {
                this.logger.LogWarning($"Could not update item '{id}' in collection '{collectionId}' for user '{userId}'");
            }
            return updated;
        }

        public async Task<JObject> CreateByCampaign(string userId, string collection, string campaignId, JObject jObject)
        {
            jObject.Remove("_id");
            var bson = jObject.AsBson();
            bson[UserIdField] = userId;
            bson[CollectionField] = collection;
            bson[CampaignField] = campaignId;
            await collections.InsertOneAsync(bson);
            return bson.AsJson();
        }

        public async Task<List<JObject>> GetListByCampaign(string collectionId, string campaignId)
        {
            var results = await collections.Find(
                data => (data[CollectionField] == collectionId && data[CampaignField] == campaignId)
            ).ToListAsync();
            if (results != null && results.Count != 0)
            {
                return results.Select(result => result.AsJson()).ToList();
            }
            this.logger.LogError($"Could not find collection '{collectionId}' for campaign '{campaignId}'");
            return new List<JObject>();
        }

        public async Task<JObject> GetByCampaign(string collectionId, string campaignId, string id)
        {
            var results = await collections.Find(
                data => (data[CollectionField] == collectionId && data[CampaignField] == campaignId && data["_id"] == ObjectId.Parse(id))
            ).ToListAsync();
            var bson = results.FirstOrDefault();
            if (bson != null)
            {
                return bson.AsJson();
            }

            var message = $"Could not find item '{id}' in collection '{collectionId}' for campaign '{campaignId}'";
            this.logger.LogError(message);
            throw new MythicTableException(message);
        }

        public async Task<int> UpdateByCampaign(string collectionId, string campaignId, string id, JsonPatchDocument patch)
        {
            var filter = Builders<BsonDocument>.Filter.Where(
                data => (data[CollectionField] == collectionId && data[CampaignField] == campaignId && data["_id"] == ObjectId.Parse(id)));
            var updated = await InternalUpdate(patch, filter);
            if (updated == 0)
            {
                this.logger.LogWarning($"Could not update item '{id}' in collection '{collectionId}' for campaign '{campaignId}'");
            }
            return updated;
        }

        public async Task<int> DeleteByCampaign(string collectionId, string campaignId, string id)
        {
            Console.WriteLine("---Actually removing from DB");
            var deleted = await collections.DeleteOneAsync(
                data =>

                    data[CollectionField] == collectionId &&
                    data[CampaignField] == campaignId &&
                    data["_id"] == ObjectId.Parse(id)
            );
            if (deleted.DeletedCount == 0)
            {
                this.logger.LogWarning($"Could not delete item '{id}' in collection '{collectionId}' for campaign '{campaignId}'");
            }
            return (int)deleted.DeletedCount;
        }

        private async Task<int> InternalUpdate(JsonPatchDocument patch, FilterDefinition<BsonDocument> filter)
        {
            var patchOperation = patch.Operations[0];
            UpdateDefinition<BsonDocument> update;

            if (patchOperation.op == "remove")
            {
                update = Builders<BsonDocument>.Update.Unset(translator.JsonPath2MongoPath(patchOperation.path));
            }
            else
            {
                update = Builders<BsonDocument>.Update.Set<BsonValue>(
                    translator.JsonPath2MongoPath(patchOperation.path),
                    translator.Json2Mongo(patchOperation.value));
            }
            for (var i = 1; i < patch.Operations.Count; i++)
            {
                var operation = patch.Operations[i];
                if (operation.op == "remove")
                {
                    update = update.Unset(translator.JsonPath2MongoPath(operation.path));
                }
                else
                {
                    update = update.Set(translator.JsonPath2MongoPath(operation.path), translator.Json2Mongo(operation.value));
                }
            }

            var results = await collections.UpdateOneAsync(filter, update);
            await InternalPull(patch, filter);
            return (int)results.ModifiedCount;
        }

        private async Task InternalPull(JsonPatchDocument patch, FilterDefinition<BsonDocument> filter)
        {
            bool pullOpsUsed = false;
            UpdateDefinition<BsonDocument> pullOps = new BsonDocument();

            for (var i = 0; i < patch.Operations.Count; ++i)
            {
                var operation = patch.Operations[i];
                var path = operation.path;
                if (operation.op == "remove" && translator.PathIsArray(path))
                {
                    pullOps = Builders<BsonDocument>.Update.Pull(translator.JsonPath2MongoArrayName(path), BsonNull.Value);
                    pullOpsUsed = true;
                }
            }
            if (pullOpsUsed)
            {
                await collections.UpdateOneAsync(filter, pullOps);
            }
        }
    }
}

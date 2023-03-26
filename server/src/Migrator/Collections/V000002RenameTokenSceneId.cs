using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDBMigrations;

namespace Migrator.Collections
{
    public class V000002MapToMap : IMigration
    {
        public Version Version => new Version(0, 0, 2);
        public string Name => "Rename Token sceneId to mapId";

        private const string CollectionField = "_collection";
        
        public void Up(IMongoDatabase db)
        {
            var collections = db.GetCollection<BsonDocument>("collections");
            var results = RenameTokenAttr("sceneId", "mapId", collections).Result;
            System.Console.WriteLine($"Renamed {results} sceneId to mapId");
        }

        public void Down(IMongoDatabase db)
        {
            var collections = db.GetCollection<BsonDocument>("collections");
            var results = RenameTokenAttr("mapId", "sceneId", collections).Result;
            System.Console.WriteLine($"Renamed {results} mapId to sceneId");
        }

        public async Task<long> RenameTokenAttr(string from, string to, IMongoCollection<BsonDocument> collections)
        {
            var filter = Builders<BsonDocument>.Filter.Where(data => (data[CollectionField] == "tokens"));
            var update = Builders<BsonDocument>.Update.Rename(from, to);
            var results = await collections.UpdateManyAsync(filter, update);
            return results.ModifiedCount;
        }
    }
}
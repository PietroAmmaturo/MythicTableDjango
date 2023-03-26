using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDBMigrations;

namespace Migrator.Collections
{
    public class V000002SceneToMap : IMigration
    {
        public Version Version => new Version(0, 0, 2);
        public string Name => "Converts Scenes Collections to Maps";

        private const string CollectionField = "_collection";
        
        public void Up(IMongoDatabase db)
        {
            var collections = db.GetCollection<BsonDocument>("collections");
            var results = UpdateName("scenes", "maps", collections).Result;
            System.Console.WriteLine($"Converted {results} scenes to maps");
        }

        public void Down(IMongoDatabase db)
        {
            var collections = db.GetCollection<BsonDocument>("collections");
            var results = UpdateName("maps", "scenes", collections).Result;
            System.Console.WriteLine($"Converted {results} maps to scenes");
        }

        public async Task<long> UpdateName(string from, string to, IMongoCollection<BsonDocument> collections)
        {
            var filter = Builders<BsonDocument>.Filter.Where(data => (data[CollectionField] == from));
            var update = Builders<BsonDocument>.Update.Set(CollectionField, to);
            var results = await collections.UpdateManyAsync(filter, update);
            return results.ModifiedCount;
        }
    }
}
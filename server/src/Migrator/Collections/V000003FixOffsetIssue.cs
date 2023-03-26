using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDBMigrations;

namespace Migrator.Collections
{
    public class V000003FixOffsetIssue : IMigration
    {
        public Version Version => new Version(0, 0, 3);
        public string Name => "Find and remove all faulty offsets in maps";

        private const string CollectionField = "_collection";
        
        public void Up(IMongoDatabase db)
        {
            var collections = db.GetCollection<BsonDocument>("collections");
            var results = FixOffsetIssue(collections).Result;
            System.Console.WriteLine($"Found and corrected {results} offset issues");
        }

        public void Down(IMongoDatabase db)
        {
        }

        public async Task<long> FixOffsetIssue(IMongoCollection<BsonDocument> collections)
        {
            var filter = Builders<BsonDocument>.Filter.Exists("stage.grid.offset._t");
            var update = Builders<BsonDocument>.Update.Unset("stage.grid.offset");
            var results = await collections.UpdateManyAsync(filter, update);
            return results.ModifiedCount;
        }
    }
}
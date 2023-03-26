using MongoDB.Bson;
using MongoDB.Driver;
using MongoDBMigrations;

namespace Migrations.Permissions
{
    public class V000004PermissionsIndex : IMigration
    {
        public Version Version => new Version(0, 0, 4);
        public string Name => "Introduces the Indexes for permissions";

        private const string KeyName = "campaign-object";

        public void Up(IMongoDatabase db)
        {
            var files = db.GetCollection<BsonDocument>("permissions");
            var keys = Builders<BsonDocument>.IndexKeys;
            var options = new CreateIndexOptions
            {
                Name = KeyName
            };
            var index = new CreateIndexModel<BsonDocument>(keys.Ascending("campaign").Ascending("object"), options);
            files.Indexes.CreateOne(index);
        }

        public void Down(IMongoDatabase db)
        {
            var files = db.GetCollection<BsonDocument>("permissions");
            files.Indexes.DropOne(KeyName);
        }
    }
}
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDBMigrations;

namespace Migrations.Files
{
    public class V000001FileDto : IMigration
    {
        public Version Version => new Version(0, 0, 1);
        public string Name => "Introduces the Indexes for md5";

        private const string KeyName = "user-md5";

        public void Up(IMongoDatabase db)
        {
            var files = db.GetCollection<BsonDocument>("files");
            var keys = Builders< BsonDocument>.IndexKeys;
            keys.Ascending("user").Ascending("md5");
            var options = new CreateIndexOptions
            {
                Name = KeyName
            };
            var index = new CreateIndexModel<BsonDocument>(keys.Ascending("user").Ascending("md5"), options);
            files.Indexes.CreateOne(index);
        }

        public void Down(IMongoDatabase db)
        {
            var files = db.GetCollection<BsonDocument>("files");
            files.Indexes.DropOne(KeyName);
        }
    }
}
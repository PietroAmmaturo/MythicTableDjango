using System;
using Mongo2Go;
using MongoDB.Driver;

namespace MythicTable.Collections.Providers
{
    public class MongoDbProcessCloser : IDisposable
    {
        public string ConnectionString => _runner.ConnectionString;
        public IMongoClient Client { get; internal set; }

        private MongoDbRunner _runner;

        public MongoDbProcessCloser()
        {
            _runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            AppDomain.CurrentDomain.ProcessExit += DisposeHook;
        }

        ~MongoDbProcessCloser()
        {
            this.Dispose();
            _runner?.Dispose();
        }

        public void Dispose()
        {
            _runner?.Dispose();
        }

        private void DisposeHook(object sender, EventArgs e)
        {
            this.Dispose();
        }
    }
}

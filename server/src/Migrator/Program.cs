using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Reflection;
using McMaster.Extensions.CommandLineUtils;
using MongoDBMigrations;
using Version = MongoDBMigrations.Version;

namespace Migrator
{
    internal class Program
    {
        [Required]
        [Argument(0, Description = "The Connection String more MongoDB")]
        public string ConnectionString { get; }

        [Required]
        [Argument(1, Description = "The Database Name")]
        public string DatabaseName { get; }

        [Option(Description = "version")] public string Version { get; }

        public static int Main(string[] args)
        {
            return CommandLineApplication.Execute<Program>(args);
        }

        private void OnExecute()
        {
            var timer = new Stopwatch();
            timer.Start();

            Console.WriteLine($"{timer.Elapsed}: Starting Migrator");

            var engine = new MigrationEngine().UseDatabase(ConnectionString, DatabaseName)
                .UseAssembly(Assembly.GetExecutingAssembly())
                .UseSchemeValidation(false)
                .UseProgressHandler((result) => Console.WriteLine($"{timer.Elapsed}: {result.MigrationName} v={result.TargetVersion}"));

            if (Version != null)
            {
                engine.Run(new Version(Version));
            }
            else
            {
                engine.Run();
            }

            Console.WriteLine($"{timer.Elapsed}: Finished Migrator");
        }
    }
}
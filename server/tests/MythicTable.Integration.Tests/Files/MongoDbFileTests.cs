using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Mongo2Go;
using MythicTable.Files.Controllers;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.TestUtils.Profile.Util;
using Newtonsoft.Json;
using Xunit;

namespace MythicTable.Integration.Tests.Files
{
    public class MongoDbFileTests : IDisposable
    {
        private readonly MongoDbRunner runner;
        private readonly HttpClient client;

        public MongoDbFileTests()
        {
            runner = MongoDbRunner.Start(additionalMongodArguments: "--quiet");
            var builder = new WebHostBuilder()
                .UseStartup<TestStartup>()
                .ConfigureAppConfiguration(configBuild =>
                {
                    var config = new Dictionary<string, string>
                    {
                        {"MTT_MONGODB_CONNECTIONSTRING", runner.ConnectionString},
                        {"MTT_MONGODB_DATABASENAME", "mythictable"}
                    };
                    configBuild.AddInMemoryCollection(config);
                });
            var server = new TestServer(builder);
            client = server.CreateClient();
        }

        public void Dispose()
        {
            client.Dispose();
            runner.Dispose();
        }

        [Fact]
        public async Task PostReturnFileDtoTest()
        {
            await ProfileTestUtil.Login(client);

            HttpResponseMessage response;
            using (var formData = new MultipartFormDataContent())
            {
                formData.Add(new StreamContent(new MemoryStream(Encoding.UTF8.GetBytes("blank"))), "files", "dummy.txt");
                response = await client.PostAsync("api/files", formData);
            }

            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8",
                response.Content.Headers.ContentType.ToString());
            var result = await response.Content.ReadAsStringAsync();
            UploadResult uploadResult = JsonConvert.DeserializeObject<UploadResult>(result);
            Assert.Equal(1, uploadResult.Count);
            Assert.Single(uploadResult.Files);
            Assert.StartsWith("https://localhost:5001/user-files/", uploadResult.Files[0].Url);
        }

        [Fact]
        public async Task GetNonExistentReturn404Test()
        {
            var response = await client.GetAsync("api/files/5515836e58c7b4fbc756320b");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
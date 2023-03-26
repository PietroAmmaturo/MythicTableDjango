using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using Microsoft.AspNetCore.Hosting;
using MythicTable.Integration.TestUtils.Helpers;
using Microsoft.AspNetCore.TestHost;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using System.IO;
using MythicTable.Files.Controllers;
using MythicTable.TestUtils.Profile.Util;

namespace MythicTable.Integration.Tests
{
    public class FileTest : IClassFixture<WebApplicationFactory<MythicTable.Startup>>
    {
        private readonly WebApplicationFactory<MythicTable.Startup> _factory;

        public FileTest(WebApplicationFactory<MythicTable.Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task PostReturnFileDtoTest()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            var client = server.CreateClient();

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
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            var client = server.CreateClient();

            var response = await client.GetAsync("api/files/1");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
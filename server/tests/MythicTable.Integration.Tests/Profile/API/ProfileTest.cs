using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using MythicTable.Integration.Tests.Helpers;
using MythicTable.Integration.TestUtils.Helpers;
using MythicTable.Profile.Data;
using Newtonsoft.Json;
using Xunit;

namespace MythicTable.Integration.Tests.Profile.API
{
    public class ProfileTest
    {
        private readonly string[] groups = new[] {"test_group1", "test_group2"};
        private readonly HttpClient client;

        public ProfileTest()
        {
            var builder = new WebHostBuilder().UseStartup<TestStartup>();
            var server = new TestServer(builder);
            client = server.CreateClient();
        }

        [Fact]
        public async void BasicFlow()
        {
            var result = await Me();

            result.ImageUrl = "http://example.com/test.png";

            await Put(result);

            var allProfiles = await Get(new []{ result.Id });
            Assert.Single(allProfiles);
            Assert.Equal("http://example.com/test.png", allProfiles.First().ImageUrl);
        }

        [Fact]
        public async void MePopulatesUserId()
        {
            var result = await Me();
            Assert.Equal("Test user", result.UserId);
        }

        [Fact]
        public async void UpdateRequiresSameUserIs()
        {
            await Me();

            var profile = new ProfileDto
            {
                Id = "Unknown user",
                DisplayName = "Test"
            };
            using var response = await client.MakeRequest(new HttpRequestInfo()
            {
                Method = HttpMethod.Put,
                Url =$"/api/profiles", 
                Content = profile 
            });
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async void MePopulatesGroups()
        {
            client.DefaultRequestHeaders.Add(
                TestStartup.FAKE_GROUP_HEADER, JsonConvert.SerializeObject(groups)
            );
            var profile = await Me();
            var publicProfile = await Get(new[]{profile.Id});
            Assert.Equal(groups, publicProfile[0].Groups);
            client.DefaultRequestHeaders.Remove(TestStartup.FAKE_GROUP_HEADER);
        }

        [Fact]
        public async void MeUpdatesGroup()
        {
            await Me();
            client.DefaultRequestHeaders.Add(
              TestStartup.FAKE_GROUP_HEADER, JsonConvert.SerializeObject(groups)
            );
            var updatedProfile = await Me();
            Assert.Equal(groups, updatedProfile.Groups);
            client.DefaultRequestHeaders.Remove(TestStartup.FAKE_GROUP_HEADER);
        }

        [Fact]
        public async void MeUpdatesGroupWhenListIsSameLength()
        {
            var newGroup = new[] {"test_group1", "test_group3"};
            client.DefaultRequestHeaders.Add(
                TestStartup.FAKE_GROUP_HEADER, JsonConvert.SerializeObject(groups)
            );
            await Me();

            client.DefaultRequestHeaders.Remove(TestStartup.FAKE_GROUP_HEADER);
            client.DefaultRequestHeaders.Add(
                TestStartup.FAKE_GROUP_HEADER, JsonConvert.SerializeObject(newGroup)
            );
            var profile = await Me();

            Assert.Equal(newGroup, profile.Groups);
            client.DefaultRequestHeaders.Remove(TestStartup.FAKE_GROUP_HEADER);
        }

        [Fact]
        public async void MeUpdatesGroupWhenListIsDifferentSize()
        {
            var newGroup = new[] {"test_group1", "test_group2", "test_group3"};
            client.DefaultRequestHeaders.Add(
                TestStartup.FAKE_GROUP_HEADER, JsonConvert.SerializeObject(groups)
            );
            await Me();

            client.DefaultRequestHeaders.Remove(TestStartup.FAKE_GROUP_HEADER);
            client.DefaultRequestHeaders.Add(
                TestStartup.FAKE_GROUP_HEADER, JsonConvert.SerializeObject(newGroup)
            );
            var profile = await Me();

            Assert.Equal(newGroup, profile.Groups);
            client.DefaultRequestHeaders.Remove(TestStartup.FAKE_GROUP_HEADER);
        }

        private async Task<ProfileDto> Me()
        {
            using var response = await client.MakeRequest(new HttpRequestInfo()
            {
                Method = HttpMethod.Get,
                Url = "/api/profiles/me"
            });
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<ProfileDto>(json);
        }

        private async Task<List<ProfileDto>> Get(string[] ids)
        {
            var queryString = ToQueryString(ids);
            using var response = await client.MakeRequest(new HttpRequestInfo()
            {
                Method = HttpMethod.Get,
                Url = $"/api/profiles{queryString}" 
            });
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<ProfileDto>>(json);
        }

        private async Task<ProfileDto> Put(ProfileDto dto)
        {
            using var response = await client.MakeRequest(new HttpRequestInfo()
            {
                Method = HttpMethod.Put,
                Url = $"/api/profiles", 
                Content = dto 
            });
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType.ToString());
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<ProfileDto>(json);
        }

        private string ToQueryString(string[] ids)
        {
            var parameters = ids.Select(id => $"userId={HttpUtility.UrlEncode(id)}");
            return "?" + string.Join("&", parameters);
        }
    }
}
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Moq;
using MythicTable.Profile.Data;
using Newtonsoft.Json;

namespace MythicTable.TestUtils.Profile.Util
{
    public class ProfileTestUtil
    {
        public static ProfileDto CreateProfile(Mock<IProfileProvider> provider, string user)
        {
            var profile = new ProfileDto
            {
                Id = Guid.NewGuid().ToString(),
                UserId = user,
            };
            provider.Setup(p => p.GetByUserId(It.IsAny<string>()))
                .ReturnsAsync(profile);
            return profile;
        }

        public static async Task<ProfileDto> Login(HttpClient client)
        {
            using var response = await client.GetAsync("/api/profiles/me");
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<ProfileDto>(json);
        }
    }
}
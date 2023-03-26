using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MythicTable.Profile.Data;
using MythicTable.Profile.Exceptions;
using MythicTable.Profile.Util;
using MythicTable.Campaign.Data;
using MythicTable.Campaign.Util;
using MythicTable.Collections.Providers;
using MythicTable.Common.Controllers;
using JsonConvert = Newtonsoft.Json.JsonConvert;

namespace MythicTable.Profile.Controller
{
    [Route("api/profiles")]
    [ApiController]
    public class ProfileController : AuthorizedController
    {
        private readonly IProfileProvider provider;
        private readonly ICampaignProvider campaignProvider;
        private readonly ICollectionProvider collectionProvider;

        public ProfileController(IProfileProvider provider, ICampaignProvider campaignProvider, ICollectionProvider collectionProvider, IMemoryCache cache) : base(provider, cache)
        {
            this.provider = provider;
            this.campaignProvider = campaignProvider;
            this.collectionProvider = collectionProvider;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ProfileDto> Me()
        {
            var userId = GetUserId();
            try
            {
                var dto = await provider.GetByUserId(userId);
                await UpdateGroups(dto);
                return dto;
            }
            catch (ProfileNotFoundException)
            {
                // TODO - Come up with a better way create a display name 
                // https://gitlab.com/mythicteam/mythictable/-/issues/145
                var userName = GetUserName();
                var displayName = userName.Contains("@") ? userName.Split("@")[0] : userName;
                var dto = new ProfileDto
                {
                    DisplayName = displayName,
                    ImageUrl = ProfileUtil.GetRandomImage(),
                    Groups = GetUserGroups()
                };
                ProfileDto profile = await provider.Create(dto, userId);
                await this.FirstTimeSetup(profile.Id);
                return profile;
            }
        }

        [HttpGet("{userId}")]
        public async Task<ProfileDto> Get(string userId)
        {
            return await provider.Get(userId);
        }

        [HttpGet]
        public async Task<List<ProfileDto>> Get([FromQuery(Name = "userId")]  List<string> userIds)
        {
            return await provider.Get(userIds.ToArray());
        }

        [Authorize]
        [HttpPut()]
        public async Task<ProfileDto> Put(ProfileDto dto)
        {
            var user = await this.GetProfileId();
            if (user != dto.Id)
            {
                throw new ProfileNotAuthorizedException($"User: '{user}' is not authorized to update profile for user: '{dto.Id}'");
            }
            dto.Groups = GetUserGroups();
            return await provider.Update(dto);
        }

        private async Task<bool> FirstTimeSetup(string userId)
        {
            await CampaignUtil.CreateTutorialCampaign(userId, campaignProvider, collectionProvider);
            return true;
        }

        private async Task<bool> UpdateGroups(ProfileDto player)
        {
            var groups = GetUserGroups();
            if(groups.Count == 0 && player.Groups == null) {
                return true;
            } else if(player.Groups == null || !ListsAreEqual(player.Groups, groups) ) {
                player.Groups = groups;
                await provider.Update(player);
            }
            return true;
        }
        private bool ListsAreEqual(List<string> l1, List<string> l2)
        {
            return l1.Count == l2.Count && l1.All(l2.Contains);
        }
    }
}

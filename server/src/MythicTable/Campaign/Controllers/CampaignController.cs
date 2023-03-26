using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MythicTable.Campaign.Data;
using MythicTable.Campaign.Util;
using MythicTable.Profile.Data;
using MythicTable.Collections.Providers;
using MythicTable.Common.Controllers;
using MythicTable.Common.Generators;

using MythicTable.Filters;

namespace MythicTable.Campaign.Controllers
{
    [Route("api/campaigns")]
    [ApiController]
    [Authorize]
    public class CampaignController : AuthorizedController
    {
        private readonly ICampaignProvider campaignProvider;
        private readonly ICollectionProvider collectionProvider;
        private readonly IProfileProvider profileProvider;

        private readonly IdGenerator  joinIdGenerator = new IdGenerator(Options.Join());

        public CampaignController(ICampaignProvider campaignProvider, ICollectionProvider collectionProvider, IProfileProvider profileProvider, IMemoryCache cache) : base(profileProvider, cache)
        {
            this.campaignProvider = campaignProvider ?? throw new ArgumentNullException(nameof(campaignProvider));
            this.collectionProvider = collectionProvider;
            this.profileProvider = profileProvider;
        }

        // GET: api/Campaigns
        [HttpGet]
        public async Task<ActionResult<List<CampaignDTO>>> GetCampaigns()
        {
            var campaigns = await this.campaignProvider.GetAll(await this.GetProfileId());

            return campaigns.Select(campaign => campaign as CampaignDTO).ToList();
        }

        // GET: api/Campaigns/5
        [HttpGet("{id}")]
        [UserIsMemberOfCampaign]
        public async Task<ActionResult<CampaignDTO>> GetCampaign(string id)
        {
            return await this.campaignProvider.Get(id);
        }

        // PUT: api/Campaigns/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        [UserOwnsCampaign]
        public async Task<IActionResult> PutCampaign(string id, CampaignDTO campaign)
        {
            await campaignProvider.Update(id, campaign);

            return NoContent();
        }

        // POST: api/Campaigns
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<CampaignDTO>> PostCampaign(CampaignDTO campaign)
        {
            var createdCampaign = await CampaignUtil.CreateDefaultCampaign(await this.GetProfileId(), campaignProvider, collectionProvider, campaign, joinIdGenerator);

            return CreatedAtAction(nameof(PostCampaign), new { id = campaign.Id }, createdCampaign as CampaignDTO);
        }

        // DELETE: api/Campaigns/5
        [HttpDelete("{id}")]
        [UserOwnsCampaign]
        public async Task<ActionResult<CampaignDTO>> DeleteCampaign(string id)
        {
            var campaign = await campaignProvider.Get(id);

            await campaignProvider.Delete(id);
            return campaign as CampaignDTO;
        }  
        
        [HttpGet("join/{joinId}")]
        public async Task<ActionResult<CampaignDTO>> GetByJoin(string joinId)
        {
            return await campaignProvider.GetByJoinId(joinId);
        }

        [HttpPut("join/{joinId}")]
        public async Task<ActionResult<CampaignDTO>> Join(string joinId)
        {
            var playerTask = GetCurrentUser();
            var campaignTask = campaignProvider.GetByJoinId(joinId);

            await Task.WhenAll(playerTask, campaignTask);
            var player = await playerTask;
            var campaign = await campaignTask;

            return await campaignProvider.AddPlayer(campaign.Id, player) as CampaignDTO;
        }

        [HttpPut("{id}/leave")]
        [UserIsMemberOfCampaign]
        public async Task<ActionResult<CampaignDTO>> Leave(string id)
        {
            var player = await GetCurrentUser();

            return await campaignProvider.RemovePlayer(id, player) as CampaignDTO;
        }

        [HttpPut("{id}/forceLeave/{playerId}")]
        [UserOwnsCampaign]
        public async Task<ActionResult<CampaignDTO>> ForceLeave(string id, string playerId)
        {
            var player = new PlayerDTO { Name = playerId };

            return await campaignProvider.RemovePlayer(id, player) as CampaignDTO;
        }

        // GET: api/campaigns/5/players
        [HttpGet("{id}/players")]
        [UserIsMemberOfCampaign]
        public async Task<List<ProfileDto>> GetPlayers(string id)
        {
            List<PlayerDTO> players = await campaignProvider.GetPlayers(id);
            return await profileProvider.Get(players.Select(player => player.Name).ToArray());
        }

        // GET: api/campaigns/5/messages
        [HttpGet("{id}/messages")]
        [UserIsMemberOfCampaign]
        public async Task<List<MessageDto>> GetMessages(string id, int pageSize = 50, int page = 1)
        {
            return await campaignProvider.GetMessages(id, pageSize, page);
        }

        private async Task<PlayerDTO> GetCurrentUser()
        {
            return new PlayerDTO
            {
                Name = await this.GetProfileId()
            };
        }
    }
}

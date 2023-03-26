using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MythicTable.Collections.Providers;
using MythicTable.Common.Controllers;
using MythicTable.Permissions.Data;
using MythicTable.Permissions.Providers;
using MythicTable.Profile.Data;

namespace MythicTable.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PermissionsController : AuthorizedController
    {
        private readonly IPermissionsProvider provider;
        private readonly IProfileProvider profileProvider;

        public PermissionsController(IPermissionsProvider provider, IProfileProvider profileProvider,
            IMemoryCache memoryCache) : base(profileProvider, memoryCache)
        {
            this.provider = provider;
            this.profileProvider = profileProvider;
        }


        // GET: api/permissions/campaignId
        [HttpGet("{campaignId}")]
        public async Task<List<PermissionsDto>> Get(string campaignId)
        {
            return await provider.GetList(campaignId);
        }
    }
}

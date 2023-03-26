using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MythicTable.Common.Controllers;
using MythicTable.Profile.Data;

namespace MythicTable.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HelloController : AuthorizedController
    {
        private readonly IProfileProvider provider;

        public HelloController(IProfileProvider provider, IMemoryCache memoryCache) : base(provider, memoryCache)
        {
            this.provider = provider;
        }

        // GET: api/hello
        [HttpGet]
        public string Hello()
        {
            return "hello";
        }

        // GET: api/hello/me
        [HttpGet("me")]
        [Authorize]
        public async Task<string> HelloMe()
        {
            var id = await this.GetProfileId();
            var me = await provider.Get(id);
            return $"hello {me.UserId}";
        }
    }
}

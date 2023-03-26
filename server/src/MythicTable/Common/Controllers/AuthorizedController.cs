using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using JsonConvert = Newtonsoft.Json.JsonConvert;
using MythicTable.Profile;
using MythicTable.Profile.Data;

namespace MythicTable.Common.Controllers
{
    public class AuthorizedController: ControllerBase
    {
        private readonly ProfileCache cache;

        public AuthorizedController(IProfileProvider provider, IMemoryCache memoryCache)
        {
            cache = new ProfileCache(provider, memoryCache);
        }

        public Task<string> GetProfileId()
        {
            var userId = GetUserId();
            return cache.CacheTryGetValueSet(userId);
        }

        public string GetUserId()
        {
            return HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public string GetUserName()
        {
            return HttpContext.User.FindFirst("preferred_username")?.Value;
        }

        public List<string> GetUserGroups()
        {
            var result = new List<string>();
            var groups = HttpContext.User.FindAll("groups");
            foreach(var i in groups) {
                result.Add(i.Value);
            }

            return result;
        }
    }
}

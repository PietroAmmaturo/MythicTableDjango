using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using MythicTable.Profile.Data;

namespace MythicTable.Profile
{
    public class ProfileCache
    {
        private readonly IProfileProvider provider;
        private readonly IMemoryCache cache;

        public ProfileCache(IProfileProvider provider, IMemoryCache cache)
        {
            this.provider = provider;
            this.cache = cache;
        }

        public async Task<string> CacheTryGetValueSet(string userIdentifier)
        {
            if (cache.TryGetValue(userIdentifier, out string profileId))
            {
                return profileId;
            }

            profileId = (await provider.GetByUserId(userIdentifier)).Id;

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromDays(3));
            cache.Set(userIdentifier, profileId, cacheEntryOptions);

            return profileId;
        }
    }
}
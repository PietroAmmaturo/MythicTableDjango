using System.Collections.Generic;
using System.Threading.Tasks;

namespace MythicTable.Profile.Data
{
    public interface IProfileProvider
    {
        Task<ProfileDto> GetByUserId(string userId);
        Task<ProfileDto> Get(string id);
        Task<List<ProfileDto>> Get(string[] ids);
        Task<ProfileDto> Create(ProfileDto profile, string id);
        Task<ProfileDto> Update(ProfileDto profile);
        Task Delete(string id);

        Task<string> GetProfileId(string keycloakId);
    }
}
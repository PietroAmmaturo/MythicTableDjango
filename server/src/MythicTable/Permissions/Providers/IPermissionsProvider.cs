using System.Collections.Generic;
using System.Threading.Tasks;
using MythicTable.Permissions.Data;

namespace MythicTable.Permissions.Providers
{
    public interface IPermissionsProvider
    {
        Task<PermissionsDto> Create(string campaignId, string objectId, PermissionsDto permissions);
        Task<List<PermissionsDto>> GetList(string campaignId);
        Task<PermissionsDto> Get(string campaignId, string objectId);
        Task<long> Update(string campaignId, PermissionsDto permissions);
        Task<long> Delete(string campaignId, string id);

        Task<bool> IsAuthorized(string userId, string campaignId, string objectId);
    }
}

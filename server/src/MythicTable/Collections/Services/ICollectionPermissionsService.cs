using MythicTable.Campaign.Data;

namespace MythicTable.Collections.Services
{
    public interface ICollectionPermissionsService
    {
        void AssertUserPermission(CollectionActionRequest permissionRequest);
    }
}
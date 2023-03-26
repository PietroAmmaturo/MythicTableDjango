using MythicTable.Campaign.Data;
using MythicTable.Collections.Exceptions;
using MythicTable.Collections.Providers;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MythicTable.Collections.Services
{
    public class CollectionPermissionsService : ICollectionPermissionsService
    {
        private ICollectionProvider _collectionProvider;

        public CollectionPermissionsService(ICollectionProvider collectionProvider)
        {
            _collectionProvider = collectionProvider;
        }

        public async void AssertUserPermission(CollectionActionRequest permissionRequest)
        {
            List<JObject> docs = await _collectionProvider.GetList(permissionRequest.UserId, permissionRequest.Collection);
            
            if (docs.Count == 0)
            {
                throw new UnauthorizedCollectionAccessException
                (
                    $"There are no matching records for User:{permissionRequest.UserId} and Collection{permissionRequest.Collection}."
                );
            }
        }
    }
}

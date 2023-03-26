using Microsoft.AspNetCore.Mvc.Filters;
using MythicTable.Campaign.Data;
using MythicTable.Collections.Services;
using System;
using System.Threading.Tasks;

namespace MythicTable.Filters
{
    [AttributeUsage(AttributeTargets.Method)]
    public class CollectionsPermissionRequired : GenericFilter
    {
        private string _collection;
        string _requiredPermission;
        public ICollectionPermissionsService PermissionService { get; set; }

        public CollectionsPermissionRequired(string collection, string requiredPermission)
        {
            _collection = collection;
            _requiredPermission = requiredPermission;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var currentUser = this.GetCurrentUser(context);

            CollectionActionRequest actionRequest = new CollectionActionRequest()
            {
                UserId = currentUser,
                Collection = _collection,
                Action = _requiredPermission
            };

            PermissionService.AssertUserPermission(actionRequest);

            await next();
        }
    }
}

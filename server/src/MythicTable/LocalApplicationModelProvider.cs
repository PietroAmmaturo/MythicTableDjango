using Microsoft.AspNetCore.Mvc.ApplicationModels;
using MythicTable.Collections.Services;
using MythicTable.Filters;
using System;
using System.Linq;

namespace MythicTable
{
    public class LocalApplicationModelProvider : IApplicationModelProvider
    {
        private ICollectionPermissionsService _collectionPermissionService;

        public int Order { get { return -1000 + 10; } }

        public LocalApplicationModelProvider(ICollectionPermissionsService collectionPermissonService)
        {
            _collectionPermissionService = collectionPermissonService;
        }

        public void OnProvidersExecuted(ApplicationModelProviderContext context)
        {
            foreach (ControllerModel controllerModel in context.Result.Controllers)
            {
                //Add dependency injection for custom attributes here

                AddAttributeDependency<CollectionsPermissionRequired>(controllerModel, a => a.PermissionService = _collectionPermissionService);
            }
        }

        public void OnProvidersExecuting(ApplicationModelProviderContext context)
        {
            
        }

        private void AddAttributeDependency<T>(ControllerModel controllerModel, Action<T> assignment)
        {
            controllerModel.Attributes
                    .OfType<T>().ToList()
                    .ForEach(assignment);

            controllerModel.Actions.SelectMany(a => a.Attributes)
                .OfType<T>().ToList()
                .ForEach(assignment);
        }
    }
}
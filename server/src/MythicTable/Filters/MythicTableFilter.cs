using System;
using System.Security.Claims;

using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

using MythicTable.Campaign.Data;
using MythicTable.Profile.Data;

namespace MythicTable.Filters
{
    public abstract class GenericFilter : ActionFilterAttribute
    {
        public ICampaignProvider GetCampaignProvider(ActionExecutingContext context)
        {
            return context.HttpContext.RequestServices.GetService<ICampaignProvider>();
        }
        public IProfileProvider GetProfileProvider(ActionExecutingContext context)
        {
            return context.HttpContext.RequestServices.GetService<IProfileProvider>();
        }

        public string GetCurrentUser(ActionExecutingContext context)
        {
            return context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public T GetPathVariable<T>(ActionExecutingContext context, string key)
        {
            var value = context.HttpContext.Request.RouteValues[key];

            if(value is T)
            {
                return (T) value; 
            }
            
            return (T) Convert.ChangeType(value, typeof(T), System.Globalization.CultureInfo.InstalledUICulture.NumberFormat);
        }
    }
}
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MythicTable.Campaign.Data
{
    public class CollectionActionRequest
    {
        public string UserId { get; set; }
        public string Collection { get; set; }
        public string Action { get; set; }
    }
}

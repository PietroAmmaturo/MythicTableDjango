using Newtonsoft.Json.Linq;

namespace MythicTable.Collections.Providers
{
    public static class CollectionExtensions
    {
        public static string GetId(this JObject obj)
        {
            return obj["_id"].ToString();
        }
    }
}

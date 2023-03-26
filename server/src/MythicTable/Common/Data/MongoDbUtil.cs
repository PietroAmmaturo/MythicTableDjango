using MongoDB.Bson;
using MythicTable.Common.Exceptions;

namespace MythicTable.Common.Data
{
    public class MongoDbUtil
    {
        public static ObjectId MakeObjectId(string id)
        {
            try
            {
                return ObjectId.Parse(id);
            }
            catch
            {
                throw new MythicTableException($"Could not parse Id: '{id}'");
            }
        }
    }
}

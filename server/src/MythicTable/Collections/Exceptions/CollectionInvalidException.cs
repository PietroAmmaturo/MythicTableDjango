using MythicTable.Common.Exceptions;

namespace MythicTable.Collections.Exceptions
{
    public class CollectionInvalidException : MythicTableException
        {
            public CollectionInvalidException(string msg): base(msg) {}
        }
}
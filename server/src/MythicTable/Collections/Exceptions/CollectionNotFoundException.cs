using MythicTable.Common.Exceptions;

namespace MythicTable.Collections.Exceptions
{
    public class CollectionNotFoundException : MythicTableException
        {
            public CollectionNotFoundException(string msg): base(msg) {}
        }
}
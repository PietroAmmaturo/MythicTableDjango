using MythicTable.Common.Exceptions;

namespace MythicTable.Collections.Exceptions
{
    public class UnauthorizedCollectionAccessException : MythicTableException
    {
        public UnauthorizedCollectionAccessException(string msg) : base(msg) { }
    }
}

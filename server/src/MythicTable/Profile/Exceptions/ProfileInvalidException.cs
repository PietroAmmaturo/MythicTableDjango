using MythicTable.Common.Exceptions;

namespace MythicTable.Profile.Exceptions
{
    public class ProfileInvalidException : MythicTableException
        {
            public ProfileInvalidException(string msg): base(msg) {}
        }
}
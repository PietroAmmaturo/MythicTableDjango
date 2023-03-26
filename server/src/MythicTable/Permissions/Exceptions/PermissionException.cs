using MythicTable.Common.Exceptions;

namespace MythicTable.Permissions.Exceptions
{
    public class PermissionException : MythicTableException
        {
            public PermissionException(string msg): base(msg) {}
        }
}

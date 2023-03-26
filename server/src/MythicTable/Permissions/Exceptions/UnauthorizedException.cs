using System.Net;

namespace MythicTable.Permissions.Exceptions
{
    public class UnauthorizedException : PermissionException
    {
        public UnauthorizedException(string msg): base(msg) { }

        public override HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
    }
}

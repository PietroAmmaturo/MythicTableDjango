using System.Net;
using MythicTable.Common.Exceptions;

namespace MythicTable.Profile.Exceptions
{
    public class ProfileNotAuthorizedException : MythicTableException
    {
        public ProfileNotAuthorizedException(string msg) : base(msg) { }

        public override HttpStatusCode StatusCode => HttpStatusCode.Forbidden;
    }
}
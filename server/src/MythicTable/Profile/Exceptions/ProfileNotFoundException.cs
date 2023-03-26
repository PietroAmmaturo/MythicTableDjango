using System.Net;
using MythicTable.Common.Exceptions;

namespace MythicTable.Profile.Exceptions
{
    public class ProfileNotFoundException : MythicTableException
    {
        public ProfileNotFoundException(string msg) : base(msg) { }

        public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
    }
}
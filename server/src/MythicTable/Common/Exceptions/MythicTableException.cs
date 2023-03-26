using System;
using System.Net;

namespace MythicTable.Common.Exceptions
{
    public class MythicTableException : Exception, IMythicTableException
    {
        public MythicTableException(string msg) : base(msg) { }

        public virtual HttpStatusCode StatusCode => HttpStatusCode.BadRequest;
    }
}
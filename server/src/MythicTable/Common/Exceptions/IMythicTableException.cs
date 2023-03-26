using System.Net;

namespace MythicTable.Common.Exceptions
{
    public interface IMythicTableException
    {
        /// <summary>
        /// HTTP status code linked to this kind of exception.
        /// </summary>
        public HttpStatusCode StatusCode { get; }
    }
}

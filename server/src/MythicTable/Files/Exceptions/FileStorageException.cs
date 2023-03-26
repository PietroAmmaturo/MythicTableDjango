using MythicTable.Common.Exceptions;
using System.Net;

namespace MythicTable.Files.Exceptions
{
    public class FileStorageException : MythicTableException
    {
        private HttpStatusCode code;

        public FileStorageException(string message, HttpStatusCode code = HttpStatusCode.InternalServerError) : base(message)
        {
            this.code = code;
        }

        public override HttpStatusCode StatusCode => code;
    }
}

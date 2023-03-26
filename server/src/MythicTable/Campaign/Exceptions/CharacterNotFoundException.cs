using MythicTable.Common.Exceptions;
using System.Net;

namespace MythicTable.Campaign.Exceptions
{
    public class CharacterNotFoundException : MythicTableException
    {
        public CharacterNotFoundException(string msg) : base(msg) { }

        public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
    }
}
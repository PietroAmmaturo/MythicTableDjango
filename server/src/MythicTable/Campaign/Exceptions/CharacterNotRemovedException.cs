using MythicTable.Common.Exceptions;
using System.Net;

namespace MythicTable.Campaign.Exceptions
{
    public class CharacterNotRemovedException : MythicTableException
    {
        public CharacterNotRemovedException(string msg) : base(msg) { }

        public override HttpStatusCode StatusCode => HttpStatusCode.BadRequest;
    }
}
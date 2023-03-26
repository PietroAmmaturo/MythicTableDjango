using System.Collections.Generic;

namespace MythicTable.Files.Controllers
{
    public class DeleteResult
    {
        public long Count { get; set; }
        public List<string> Ids { get; set; }
    }
}
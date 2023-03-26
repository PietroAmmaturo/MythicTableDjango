using MythicTable.Files.Data;
using System.Collections.Generic;

namespace MythicTable.Files.Controllers
{
    public class UploadResult
    {
        public long Count { get; set; }
        public long Size { get; set; }
        public List<FileDto> Files { get; set; }
    }
}
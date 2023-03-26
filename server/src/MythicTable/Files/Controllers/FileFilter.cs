using Microsoft.AspNetCore.Mvc;

namespace MythicTable.Files.Controllers
{
    public class FileFilter
    {
        [FromQuery]
        public string Path { get; set; }
    }
}
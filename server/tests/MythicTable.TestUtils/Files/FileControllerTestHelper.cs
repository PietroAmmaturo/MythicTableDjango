using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MythicTable.Files.Controllers;
using MythicTable.Files.Data;

namespace MythicTable.TestUtils.Files
{
    public class FileControllerTestHelper
    {
        public static async Task<FileDto> PostFile(FormFileCollection fileCollection, FileController controller)
        {
            var actionResult = await controller.PostFile(fileCollection) as ActionResult<UploadResult>;
            var okResult = actionResult.Result as OkObjectResult;
            var results = okResult.Value as UploadResult;
            var firstFile = results.Files.Single();
            return firstFile;
        }
    }
}

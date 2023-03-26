using Microsoft.AspNetCore.Mvc;

namespace MythicTable.Controllers
{
    // ReSharper disable once StringLiteralTypo
    [Route("healthz")]
    public class HealthController
    {
        // GET: /healthz
        [HttpGet]
        public void Health()
        {
        }
    }
}

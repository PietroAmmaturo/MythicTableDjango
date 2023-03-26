using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace MythicTable.Integration.Tests.Helpers
{
    public class HttpRequestInfo
    {
        public HttpClient Client { get; set; }
        public HttpMethod Method { get; set; }
        public string Url { get; set; }
        public object Content { get; set; }
        public CancellationToken CancelToken { get; set; }
    }
}

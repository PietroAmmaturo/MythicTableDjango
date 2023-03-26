using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.TestHost;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System;
using MythicTable.Integration.Tests.Helpers;

namespace MythicTable.Integration.TestUtils.Helpers
{
    public static class RequestHelper
    {
        private const string DEFAULT_PROFILE = @"/api/profiles/me";
        private const string MEDIA_HEADER_JSON = @"application/json";

        public static async Task<HttpResponseMessage> CreateUser(this TestServer server, string userId, string userName = "test@user.me") 
        {
            var userReq = server.CreateRequest(DEFAULT_PROFILE);
            userReq.AddHeader(TestStartup.FAKE_USER_ID_HEADER, userId);
            userReq.AddHeader(TestStartup.FAKE_USER_NAME_HEADER, userName);
            return await userReq.GetAsync();
        }

        public static async Task<HttpResponseMessage> MakeRequest(this HttpClient client, HttpRequestInfo httpRequestInfo)
        {
            httpRequestInfo.Client = client;
            return await MakeRequest(httpRequestInfo);
        }


        public static async Task<HttpResponseMessage> MakeRequest(HttpRequestInfo httpRequestInfo)
        {
            using HttpRequestMessage request = new HttpRequestMessage(httpRequestInfo.Method, httpRequestInfo.Url);
            using HttpContent httpContent = CreateHttpContent(httpRequestInfo.Content);
            request.Content = httpContent;

            return await httpRequestInfo.Client
                    .SendAsync(request, HttpCompletionOption.ResponseHeadersRead, httpRequestInfo.CancelToken)
                    .ConfigureAwait(false);
        }

        private static HttpContent CreateHttpContent(object content)
        {
            HttpContent httpContent = null;

            if (content != null)
            {
                MemoryStream ms = new MemoryStream();
                SerializeJsonIntoStream(content, ms);
                ms.Seek(0, SeekOrigin.Begin);
                httpContent = new StreamContent(ms);
                httpContent.Headers.ContentType = new MediaTypeHeaderValue(MEDIA_HEADER_JSON);
            }

            return httpContent;
        }

        private static void SerializeJsonIntoStream(object value, Stream stream)
        {
            using var sw = new StreamWriter(stream, new UTF8Encoding(false), 1024, true);
            using (var jtw = new JsonTextWriter(sw) { Formatting = Formatting.None })
            {
                new JsonSerializer().Serialize(jtw, value);
            }
        }
    }
}
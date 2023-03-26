using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using MythicTable.Common.Exceptions;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Net.Mime;
using System.Threading.Tasks;

namespace MythicTable.Middleware
{
    /// <summary>
    /// Middleware to catch and handle all exceptions.
    /// </summary>
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate request;
        private readonly ILogger logger;

        public ErrorHandlerMiddleware(RequestDelegate request, ILogger<ErrorHandlerMiddleware> logger)
        {
            this.request = request;
            this.logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await request(context);
            }
            catch (Exception exception)
            {
                await WriteExceptionToResponse(exception, context);
            }
        }

        private Task WriteExceptionToResponse(Exception exception, HttpContext context)
        {
            this.logger.LogError($"Unhandled Exception: {exception.Message}");
            this.logger.LogError(exception.StackTrace);

            var result = JsonConvert.SerializeObject(new { error = exception.Message });
            context.Response.ContentType = MediaTypeNames.Application.Json;
            context.Response.StatusCode = GetStatusCode(exception);
            return context.Response.WriteAsync(result);
        }

        private int GetStatusCode(Exception exception)
        {
            var code = HttpStatusCode.InternalServerError;

            if (exception is IMythicTableException campaignException)
            {
                code = campaignException.StatusCode;
            }

            return (int)code;
        }
    }
}

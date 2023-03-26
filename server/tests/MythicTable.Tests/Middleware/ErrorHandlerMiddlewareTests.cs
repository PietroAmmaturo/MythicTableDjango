using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using MythicTable.Campaign.Exceptions;
using MythicTable.Common.Exceptions;
using MythicTable.Middleware;
using Xunit;

namespace MythicTable.Tests.Middleware
{
    public class ErrorHandlerMiddlewareTests
    {
        private readonly HttpContext context;
        private readonly ILogger<ErrorHandlerMiddleware> logger;

        public ErrorHandlerMiddlewareTests()
        {
            context = new DefaultHttpContext();
            logger = Mock.Of<ILogger<ErrorHandlerMiddleware>>();
        }

        [Fact]
        public async void TestSuccessfulRequestReturnsExpected()
        {
            const int successfulStatusCode = (int)HttpStatusCode.NoContent;

            RequestDelegate request = (context) =>
            {
                context.Response.StatusCode = successfulStatusCode;
                return Task.CompletedTask; 
            };

            var sut = new ErrorHandlerMiddleware(request, logger);

            await sut.Invoke(this.context);

            Assert.Equal(successfulStatusCode, context.Response.StatusCode);
        }

        [Fact]
        public async void TestCampaignNotFoundExceptionReturnsNotFound()
        {
            RequestDelegate request = (context) =>
            {
                throw new CampaignNotFoundException(string.Empty);
            };

            var sut = new ErrorHandlerMiddleware(request, logger);

            await sut.Invoke(this.context);

            Assert.Equal((int)HttpStatusCode.NotFound, context.Response.StatusCode);
        }

        [Fact]
        public async void TestCampaignExceptionReturnsBadRequest()
        {
            RequestDelegate request = (context) =>
            {
                throw new MythicTableException(string.Empty);
            };

            var sut = new ErrorHandlerMiddleware(request, logger);

            await sut.Invoke(this.context);

            Assert.Equal((int)HttpStatusCode.BadRequest, context.Response.StatusCode);
        }


        [Fact]
        public async void TestNonCampaignExceptionReturnsInternalServerError()
        {
            RequestDelegate request = (context) =>
            {
                throw new ArithmeticException();
            };

            var sut = new ErrorHandlerMiddleware(request, logger);

            await sut.Invoke(this.context);

            Assert.Equal((int)HttpStatusCode.InternalServerError, context.Response.StatusCode);
        }
    }
}

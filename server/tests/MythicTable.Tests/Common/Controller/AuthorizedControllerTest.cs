using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using MythicTable.Common.Controllers;
using MythicTable.Profile.Data;
using MythicTable.TestUtils.Profile.Util;
using Xunit;

namespace MythicTable.Tests.Common.Controller
{
    public class AuthorizedControllerTest
    {
        private readonly AuthorizedController controller;
        private readonly Mock<IProfileProvider> provider;

        private string User { get; } = "jon@example.com";

        public AuthorizedControllerTest()
        {
            provider = new Mock<IProfileProvider>();
            var cache = new MemoryCache(new MemoryCacheOptions());
            controller = new AuthorizedController(provider.Object, cache);

            var mockHttpContext = new Mock<HttpContext>();
            mockHttpContext.Setup(hc => hc.User.FindFirst(It.IsAny<string>()))
                           .Returns(() => new Claim("", User));
            controller.ControllerContext.HttpContext = mockHttpContext.Object;
        }

        [Fact]
        public async void ReturnsProfileId()
        {
            var profile = ProfileTestUtil.CreateProfile(provider, User);
            var userId = await controller.GetProfileId();
            Assert.Equal(profile.Id, userId);
        }

        [Fact]
        public async void OnlyCallGetOnce()
        {
            ProfileTestUtil.CreateProfile(provider, User);
            await controller.GetProfileId();
            await controller.GetProfileId();
            provider.Verify(p => p.GetByUserId(It.IsAny<string>()), Times.Once());
        }
    }
}
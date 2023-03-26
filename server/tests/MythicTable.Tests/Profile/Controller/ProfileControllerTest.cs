using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using MythicTable.Campaign.Data;
using MythicTable.Profile.Controller;
using MythicTable.Collections.Providers;
using MythicTable.Profile.Data;
using MythicTable.Profile.Exceptions;
using Newtonsoft.Json.Linq;
using Xunit;

namespace MythicTable.Tests.Profile.Controller
{
    public class ProfileControllerTest : IAsyncLifetime
    {
        private ProfileController controller;
        private Mock<IProfileProvider> providerMock;
        private Mock<ICampaignProvider> campaignProviderMock;
        private Mock<ICollectionProvider> collectionProviderMock;
        private MemoryCache cache;


        private string User { get; set; } = "jon@example.com";

        public Task InitializeAsync()
        {
            cache = new MemoryCache(new MemoryCacheOptions());
            campaignProviderMock = new Mock<ICampaignProvider>();
            collectionProviderMock = new Mock<ICollectionProvider>();
            providerMock = new Mock<IProfileProvider>();
            controller = new ProfileController(providerMock.Object, campaignProviderMock.Object, collectionProviderMock.Object, new MemoryCache(new MemoryCacheOptions()));

            var mockHttpContext = new Mock<HttpContext>();
            mockHttpContext.Setup(hc => hc.User.FindFirst(It.IsAny<string>()))
                           .Returns(() => new Claim("", User));
            controller.ControllerContext.HttpContext = mockHttpContext.Object;

            campaignProviderMock.Setup(provider => provider.Create(It.IsAny<CampaignDTO>(), It.IsAny<string>()))
                .ReturnsAsync(new CampaignDTO() { Id = "test campaign" });
            collectionProviderMock.Setup(provider => provider.CreateByCampaign(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<JObject>()))
                .ReturnsAsync(new JObject{{ "_id", "test object" }});
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }

        [Fact]
        public async void MeCreatesProfile()
        {
            var profileDto = new ProfileDto
            {
                Id = "test id"
            };
            providerMock.Setup(provider => provider.GetByUserId(It.IsAny<string>())).ReturnsAsync(profileDto);
            providerMock.Setup(provider => provider.Get(It.IsAny<string>())).ReturnsAsync(profileDto);
            var profile = await controller.Me();

            var results = await controller.Get(profile.Id);
            Assert.Equal(profile.Id, results.Id);
        }

        [Fact]
        public async void BasicFlow()
        {
            providerMock.Setup(provider => provider.GetByUserId(It.IsAny<string>())).ReturnsAsync(new ProfileDto());
            providerMock.Setup(provider => provider.Get(It.IsAny<string[]>())).ReturnsAsync(new List<ProfileDto>(){new ProfileDto()});
            var result = await controller.Me();

            result.ImageUrl = "http://example.com/test.png";
            await controller.Put(result);

            var allProfiles = await controller.Get(new List<string>{ result.Id });
            Assert.Single(allProfiles);
        }

        [Fact]
        public async void MePopulatesUserId()
        {
            providerMock.Setup(provider => provider.GetByUserId(It.IsAny<string>())).ReturnsAsync(new ProfileDto(){DisplayName = "jon"});
            var result = await controller.Me();
            Assert.Equal("jon", result.DisplayName);
        }

        [Fact]
        public async void MePopulatesDisplayName()
        {
            providerMock.Setup(provider => provider.GetByUserId(It.IsAny<string>())).ThrowsAsync(new ProfileNotFoundException(string.Empty));
            providerMock.Setup(provider => provider.Create(It.IsAny<ProfileDto>(), User)).ReturnsAsync(new ProfileDto());
            var result = await controller.Me();
            providerMock.Verify(provider => provider.Create(It.Is<ProfileDto>(dto => dto.DisplayName == "jon"), It.Is<string>(id => id == User)));
        }

        [Fact]
        public async void UpdateRequiresSameUserIs()
        {
            var profile = new ProfileDto
            {
                Id = "Invalid",
                DisplayName = "Test"
            };
            providerMock.Setup(provider => provider.GetByUserId(It.IsAny<string>())).ReturnsAsync((string user) => new ProfileDto(){Id = user });
            var exception = await Assert.ThrowsAsync<ProfileNotAuthorizedException>(() => controller.Put(profile));
            Assert.Equal($"User: '{User}' is not authorized to update profile for user: '{profile.Id}'", exception.Message);
        }
    }
}
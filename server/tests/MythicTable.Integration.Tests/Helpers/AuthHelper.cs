using System.Security.Claims;
using System.Collections.Generic;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;


namespace MythicTable.Integration.TestUtils.Helpers
{
    public class TestStartup : Startup
    {
        public const string FAKE_USER_ID_HEADER = "FakeUserId";
        public const string FAKE_USER_NAME_HEADER = "FakeUserName";
        public const string FAKE_GROUP_HEADER = "FakeGroupClaims";

        public const string DEFAULT_USER_ID = "Test user";

        public TestStartup(IWebHostEnvironment environment, IConfiguration configuration): base(environment, configuration)
        {
        }

        protected override void ConfigureAuthentication(IServiceCollection services)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Test"; // has to match scheme in TestAuthenticationExtensions
                options.DefaultChallengeScheme = "Test";
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
        }
    }

    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, 
            ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, GetTestUserId()),
                new Claim("preferred_username", GetTestUserName()),
            };

            claims.AddRange(GetGroupClaims());

            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "Test");

            var result = AuthenticateResult.Success(ticket);

            return Task.FromResult(result);
        }

        private List<Claim> GetGroupClaims()
        {
            var result = new List<Claim>();
            if (Request.Headers.ContainsKey(TestStartup.FAKE_GROUP_HEADER))
            {
                var groups = JsonConvert.DeserializeObject<List<string>>(
                    Request.Headers[TestStartup.FAKE_GROUP_HEADER]
                );
                foreach(var group in groups) 
                {
                    result.Add(new Claim("groups", group));
                }
            }
            return result;
        }

        private string GetTestUserId()
        {
            if (Request.Headers.ContainsKey(TestStartup.FAKE_USER_ID_HEADER))
            {
                return Request.Headers[TestStartup.FAKE_USER_ID_HEADER];
            }
            return "Test user";
        }

        private string GetTestUserName()
        {
            if (Request.Headers.ContainsKey(TestStartup.FAKE_USER_NAME_HEADER))
            {
                return Request.Headers[TestStartup.FAKE_USER_NAME_HEADER];
            }
            return "test@user.me";
        }
    }
}
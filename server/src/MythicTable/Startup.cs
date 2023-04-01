using System;
using System.IO;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.OpenApi.Models;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using MongoDB.Driver;
using MythicTable.Campaign.Data;
using MythicTable.Middleware;
using Microsoft.IdentityModel.Logging;
using MythicTable.Files.Data;
using MythicTable.Files.Store;
using Microsoft.AspNetCore.Hosting;
using MythicTable.Collections.Providers;
using MythicTable.Profile.Data;
using MythicTable.Collections.Services;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using MythicTable.Permissions.Providers;
using MythicTable.SignalR;

namespace MythicTable
{
    public class Startup
    {
        private ILogger logger;
        public IWebHostEnvironment Env { get; }
        public IConfiguration Configuration { get; }

        public Startup(IWebHostEnvironment environment, IConfiguration configuration)
        {
            Env = environment;
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvcCore(options =>
            {
                options.EnableEndpointRouting = false;
            }).AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
            }).AddApiExplorer();

            services.TryAddEnumerable(ServiceDescriptor.Transient<IApplicationModelProvider, LocalApplicationModelProvider>());

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
            });

            services.AddCors();
            services.AddSignalR().AddNewtonsoftJsonProtocol();

            var redis = Configuration.GetValue<string>("MTT_REDIS_CONN_STRING");
            if (!string.IsNullOrEmpty(redis))
            {
                services.AddSignalR().AddStackExchangeRedis(redis);
            }

            services.AddRazorPages();

            AddDatabase(services);
            AddFileStorage(services);

            services.AddControllers();

            ConfigureAuthentication(services);
            services.AddAuthorization();

            services.AddMemoryCache();


            services.AddTransient<ICollectionPermissionsService, CollectionPermissionsService>();
        }

        public void Configure(IApplicationBuilder app, ILogger<Startup> logger)
        {
            this.logger = logger;
            if (Env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                // Make sure CORS policy accepts client running with node.js
                var allowedOrigin = Configuration.GetValue<string>("MTT_ALLOW_ORIGIN");
                if (allowedOrigin != null)
                {
                    app.UseCors(builder =>
                    {
                        builder.WithOrigins(allowedOrigin)
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
                }
                
                IdentityModelEventSource.ShowPII = true; 
            }
            
            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseMiddleware<ErrorHandlerMiddleware>();

            app.UseMvc();

            app.UseSwagger();

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mythic Table API");
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<LivePlayHub>("/api/live");
                endpoints.MapRazorPages();
                endpoints.MapControllers();
            });

            app.UseLocalFileServer(Env, Configuration);
        }

        protected virtual void ConfigureAuthentication(IServiceCollection services)
        {
            // setting auth mechanism
            services.AddAuthentication(options =>
            {
                // Identity made Cookie authentication the default.
                // However, we want JWT Bearer Auth to be the default.
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            // configuring authentication provider
            .AddJwtBearer(options =>
            {
                // it is using an external autority provider!
                var authority = Configuration.GetValue<string>("MTT_AUTHORITY") ?? "https://key.mythictable.com";
                var realm = Configuration.GetValue<string>("MTT_REALM") ?? "MythicTable";
                options.Authority = $"{authority}/{realm}"; // it is just a string
                options.Audience = "account";
                options.RequireHttpsMetadata = Env.IsProduction();

                // We have to hook the OnMessageReceived event in order to
                // allow the JWT authentication handler to read the access
                // token from the query string when a WebSocket or
                // Server-Sent Events request comes in.

                // Sending the access token in the query string is required due to
                // a limitation in Browser APIs. We restrict it to only calls to the
                // SignalR hub in this code.
                // See https://docs.microsoft.com/aspnet/core/signalr/security#access-token-logging
                // for more information about security considerations when using
                // the query string to transmit the access token.
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        // reading token
                        var accessToken = context.Request.Query["access_token"];
                        Console.Out.WriteLine($"Reading Token", accessToken);
                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/api")))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                            Console.Out.WriteLine($"Setting Token", accessToken.ToString());
                            // The "context.Token" property is used for autentication from JwtBearerEvents
                        }
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        var authException = context.Exception;
                        this.logger.LogDebug(authException.ToString());
                        return Task.CompletedTask;
                    }
                };
            });
        }

        private void AddDatabase(IServiceCollection services)
        {
            var conn = Configuration.GetValue<string>("MTT_MONGODB_CONNECTIONSTRING");
            var db = Configuration.GetValue<string>("MTT_MONGODB_DATABASENAME");
            MongoDbSettings mongoSettings = null;
            if (string.IsNullOrEmpty(conn) || string.IsNullOrEmpty(db))
            {
                MongoDbProcessCloser managedRunner = new MongoDbProcessCloser();
                services.AddSingleton(managedRunner);

                mongoSettings = new MongoDbSettings
                {
                    ConnectionString = managedRunner.ConnectionString,
                    DatabaseName = "mythicTable"
                };
            }
            else
            {
                var host = conn.Substring(conn.LastIndexOf('@') + 1);
                Console.Out.WriteLine($"Using a mongodb datastore at {host} with db name {db}, connection string: {conn}");
                mongoSettings = new MongoDbSettings 
                {
                    ConnectionString = conn,
                    DatabaseName = db
                };
            }
            services.AddSingleton(mongoSettings);
            services.AddSingleton<IMongoClient>(new MongoClient(mongoSettings.ConnectionString));
            services.AddSingleton<ICampaignProvider, MongoDbCampaignProvider>();
            services.AddSingleton<IFileOwnershipProvider, MongoDbFileOwnershipProvider>();
            services.AddSingleton<ICollectionProvider, MongoDbCollectionProvider>();
            services.AddSingleton<IProfileProvider, MongoDbProfileProvider>();
            services.AddSingleton<IPermissionsProvider, MongoDbPermissionsProvider>();
        }

        private void AddFileStorage(IServiceCollection services)
        {
            if (Configuration.GetValue<Boolean>("MTT_USE_GCP_IMAGE_STORE"))
            {
                var fileName = Configuration.GetValue<string>("MTT_GCP_CREDENTIAL_FILE");
                var googleCredential = string.IsNullOrEmpty(fileName) ?
                    GoogleCredential.GetApplicationDefault() :
                    GoogleCredential.FromFile(fileName);
                var storageClient = StorageClient.Create(googleCredential);
                services.AddSingleton(storageClient);
                services.AddSingleton<IFileStore, GoogleCloudStore>();
            }
            else
            {
                string assetPath;
                if (Env.IsDevelopment())
                {
                    assetPath = Path.Combine(Directory.GetCurrentDirectory(), "user-files");
                }
                else
                {
                    assetPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user-files");
                }
                services.AddSingleton<IFileStore>(new LocalFileStore(assetPath, new FileWriter(),
                    "https://localhost:5001/user-files/"));
            }
        }
    }
}
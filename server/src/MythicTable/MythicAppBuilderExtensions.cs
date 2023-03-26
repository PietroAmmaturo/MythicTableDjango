using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;

namespace MythicTable
{
    public static class MythicAppBuilderExtensions
    {
        public static IApplicationBuilder UseLocalFileServer(this IApplicationBuilder app, IWebHostEnvironment env, IConfiguration configuration)
        {
            if (env.IsDevelopment())
            {
                if (!configuration.GetValue<Boolean>("MTT_USE_GCP_IMAGE_STORE"))
                {
                    var assetPath = Path.Combine(Directory.GetCurrentDirectory(), "user-files");
                    Directory.CreateDirectory(assetPath);
                    IFileProvider userFileProvider = new PhysicalFileProvider(assetPath);
                    app.UseStaticFiles(new StaticFileOptions { FileProvider = userFileProvider, RequestPath = "/user-files" });
                }
            }
            else
            {
                app.Use(async (context, next) =>
                {
                    // Redirect all unknown paths to default file so that client-side SPA works
                    var requestPath = context.Request.Path;
                    var isAllowedStaticFile = requestPath.StartsWithSegments("/css")
                        || requestPath.StartsWithSegments("/js")
                        || requestPath.StartsWithSegments("/static")
                        || requestPath.StartsWithSegments("/user-files")
                        || requestPath.StartsWithSegments("/.well-known")
                        || requestPath == "/favicon.ico";

                    if (!isAllowedStaticFile)
                    {
                        context.Request.Path = new PathString("/index.html");
                    }

                    await next();
                });

                var wwwRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                Directory.CreateDirectory(wwwRoot);
                IFileProvider staticFileProvider = new PhysicalFileProvider(wwwRoot);
                app.UseStaticFiles(new StaticFileOptions { FileProvider = staticFileProvider });

                if (!configuration.GetValue<bool>("MTT_USE_GCP_IMAGE_STORE"))
                {
                    var assetPath = Path.Combine(wwwRoot, "user-files");
                    Directory.CreateDirectory(assetPath);
                }
            }
            return app;
        }
    }
}

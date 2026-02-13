using System;
using System.Net;
using System.Net.Http;
using System.Globalization;
using System.Security.Authentication;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Annytab.Scripts
{
    public class Startup
    {
        public IConfiguration configuration { get; set; }

        public Startup(IConfiguration configuration)
        {
            this.configuration = configuration;

        } // End of the constructor method

        public void ConfigureServices(IServiceCollection services)
        {
            // Add the mvc framework
            services.AddRazorPages();

            // Set limits for form options
            services.Configure<FormOptions>(x =>
            {
                x.BufferBody = false;
                x.KeyLengthLimit = 2048; // 2 KiB
                x.ValueLengthLimit = 4194304; // 32 MiB
                x.ValueCountLimit = 2048;// 1024
                x.MultipartHeadersCountLimit = 32; // 16
                x.MultipartHeadersLengthLimit = 32768; // 16384
                x.MultipartBoundaryLengthLimit = 256; // 128
                x.MultipartBodyLengthLimit = 134217728; // 128 MiB
            });


            // Create api options
            services.Configure<BankIdOptions>(configuration.GetSection("BankIdOptions"));

            // Create clients
            services.AddHttpClient<IBankIdClient, BankIdClient>()
                .ConfigurePrimaryHttpMessageHandler(() =>
                {
                    HttpClientHandler handler = new HttpClientHandler
                    {
                        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                        ClientCertificateOptions = ClientCertificateOption.Manual,
                        SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11,
                        ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => { return true; }
                    };
                    handler.ClientCertificates.Add(new X509Certificate2("C:\\DATA\\BankID\\Certificates\\FPTestcert2_20150818_102329.pfx", "qwerty123"));
                    return handler;
                });

            // Create api options
            services.Configure<FrejaOptions>(configuration.GetSection("FrejaOptions"));

            // Create clients
            services.AddHttpClient<IFrejaClient, FrejaClient>()
                .ConfigurePrimaryHttpMessageHandler(() =>
                {
                    HttpClientHandler handler = new HttpClientHandler
                    {
                        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                        ClientCertificateOptions = ClientCertificateOption.Manual,
                        SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11,
                        ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => { return true; }
                    };
                    handler.ClientCertificates.Add(new X509Certificate2("C:\\DATA\\home\\Freja\\Certificates\\ANameNotYetTakenAB_1.pfx", "5iTCTp"));
                    return handler;
                });

        } // End of the ConfigureServices method

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Use error handling
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseStatusCodePagesWithReExecute("/home/error/{0}");
            }

            // To get client ip address
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            // Use static files
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    // Cache static files for 30 days
                    ctx.Context.Response.Headers.Add("Cache-Control", "public,max-age=2592000");
                    ctx.Context.Response.Headers.Add("Expires", DateTime.UtcNow.AddDays(30).ToString("R", CultureInfo.InvariantCulture));
                }
            });

            // For most apps, calls to UseAuthentication, UseAuthorization, and UseCors must 
            // appear between the calls to UseRouting and UseEndpoints to be effective.
            app.UseRouting();

            // Use authentication and authorization middlewares
            app.UseAuthentication();
            app.UseAuthorization();

            // Routing endpoints
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    "default",
                    "{controller=home}/{action=index}/{id?}");
            });

        } // End of the Configure method

    } // End of the class

} // End of the namespace
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Annytab.Scripts
{
    /// <summary>
    /// This class represent the application
    /// </summary>
    public class Program
    {
        /// <summary>
        /// This method is the entry point for the application
        /// </summary>
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();

        } // End of the main method

        /// <summary>
        /// Build the web host
        /// </summary>
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.ConfigureKestrel(serverOptions =>
                    {
                        // Set properties and call methods on options
                    })
                    .UseStartup<Startup>();
                });

    } // End of the class

} // End of the namespace
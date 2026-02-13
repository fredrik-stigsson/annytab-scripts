using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Annytab.Scripts.Models;

namespace Annytab.Scripts.Controllers
{
    /// <summary>
    /// This class controls the front pages of the website
    /// </summary>
    public class homeController : Controller
    {
        #region Variables

        private readonly ILogger logger;

        #endregion

        #region Constructors

        /// <summary>
        /// Create a new home controller
        /// </summary>
        public homeController(ILogger<homeController> logger)
        {
            // Set values for instance variables
            this.logger = logger;

        } // End of the constructor

        #endregion

        #region View methods

        // Get the default page
        // GET: /home/
        [HttpGet]
        public async Task<IActionResult> index(string id = "default")
        {
            // Return the view
            return View(id);

        } // End of the index method

        #endregion

        #region Post methods

        // Test post
        // POST: /home/test
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> test(IFormCollection collection)
        {
            // Get form data
            string username = collection["txtUsername"];

            // Wait some time
            await Task.Delay(1000);

            // Return a success response
            return Json(data: new ResponseData(true, "", $"Everyting was perfect, {username}"));

        } // End of the edit method

        // Verify a username
        // POST: /home/verify_username
        [HttpPost]
        public async Task<IActionResult> verify_username(IFormCollection collection)
        {
            // Get form data
            string id = collection["txtId"].ToString();
            string username = collection["txtUsername"].ToString();

            // Check if the username exists already
            if (username == "Master")
            {
                // Return false
                return Ok(false);
            }

            // Return success
            return Ok(true);

        } // End of the verify_username method

        #endregion

    } // End of the class

} // End of the namespace
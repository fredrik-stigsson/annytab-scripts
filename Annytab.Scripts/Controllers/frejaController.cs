using System;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Annytab.Scripts.Models;

namespace Annytab.Scripts.Controllers
{
    public class frejaController : Controller
    {
        #region Variables

        private readonly ILogger logger;
        private readonly IFrejaClient freja_client;

        #endregion

        #region Constructors

        public frejaController(ILogger<frejaController> logger, IFrejaClient freja_client)
        {
            // Set values for instance variables
            this.logger = logger;
            this.freja_client = freja_client;

        } // End of the constructor

        #endregion

        #region Post methods

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> authentication(IFormCollection collection)
        {
            // Get form data
            string userInfoType = collection["userInfoType"];
            string userInfo = collection["txtUserInfo"];

            // Check if email is personal id
            if(userInfoType == "SSN")
            {
                userInfo = Convert.ToBase64String(Encoding.UTF8.GetBytes("{\"ssn\":" + Convert.ToInt64(userInfo) + ", \"country\":\"" + "SE" + "\"}"));
            }

            // Authenticate with freja eID v1.0
            bool success = await this.freja_client.Authenticate(userInfoType, userInfo);
            if (success == false)
            {
                return Json(data: new ResponseData(false, "", "Was not able to authenticate you with Freja eID. If you have a Freja eID app with a valid certificate, try again."));
            }

            // Return a response
            return Json(data: new ResponseData(success, "You were successfully authenticated!", null));

        } // End of the authentication method

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> sign(IFormCollection collection)
        {
            // Create a signature
            Annytab.Scripts.Models.Signature signature = new Annytab.Scripts.Models.Signature();
            signature.validation_type = "Freja eID v1.0";

            // Get form data
            signature.data = collection["txtSignatureData"];
            string userInfoType = collection["userInfoType"];
            string userInfo = collection["txtUserInfo"];

            // Check if email is personal id
            if (userInfoType == "SSN")
            {
                userInfo = Convert.ToBase64String(Encoding.UTF8.GetBytes("{\"ssn\":" + Convert.ToInt64(userInfo) + ", \"country\":\"" + "SE" + "\"}"));
            }

            // Sign with freja eID
            bool success = await this.freja_client.Sign(userInfoType, userInfo, signature);
            if (success == false)
            {
                return Json(data: new ResponseData(false, "", "The file could not be signed with Freja eID. If you have a Freja eID app with a valid certificate, try again."));
            }

            // Return a response
            return Json(data: new ResponseData(success, "Signature was successfully created!", signature.value, signature.certificate));

        } // End of the sign method

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult validate(IFormCollection collection)
        {
            // Create a signature
            Annytab.Scripts.Models.Signature signature = new Annytab.Scripts.Models.Signature();
            signature.validation_type = "Freja eID v1.0";
            signature.algorithm = "SHA-256";
            signature.padding = "Pkcs1";
            signature.data = collection["txtSignatureData"];
            signature.value = collection["txtSignatureValue"];
            signature.certificate = collection["txtSignatureCertificate"];

            // Validate the signature
            SignatureValidationResult result = this.freja_client.Validate(signature);

            // Set a title and a message
            string title = result.valid == false ? "Invalid Signature" : "Valid Signature";
            string message = "<b>" + title + "</b><br />" + signature.data + "<br />" + result.signatory + "<br />";
            message += result.certificate != null ? result.certificate.GetNameInfo(X509NameType.SimpleName, false) + ", " + result.certificate.GetNameInfo(X509NameType.SimpleName, true)
                + ", " + result.certificate.NotBefore.ToString("yyyy-MM-dd") + " to "
                + result.certificate.NotAfter.ToString("yyyy-MM-dd") : "";

            // Return a response
            return Json(data: new ResponseData(result.valid, title, message));

        } // End of the validate method

        #endregion

    } // End of the class

} // End of the namespace
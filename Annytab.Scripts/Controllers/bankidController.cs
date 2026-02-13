using System.Threading.Tasks;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Annytab.Scripts.Models;

namespace Annytab.Scripts.Controllers
{
    public class bankidController : Controller
    {
        #region Variables

        private readonly ILogger logger;
        private readonly IBankIdClient bankid_client;

        #endregion

        #region Constructors

        public bankidController(ILogger<bankidController> logger, IBankIdClient bankid_client)
        {
            // Set values for instance variables
            this.logger = logger;
            this.bankid_client = bankid_client;

        } // End of the constructor

        #endregion

        #region Post methods

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> authentication(IFormCollection collection)
        {
            // Get form data
            string personal_id = collection["txtPersonalId"];

            // Authenticate with BankID v5
            bool success = await this.bankid_client.Authenticate(personal_id, ControllerContext.HttpContext.Connection.RemoteIpAddress.ToString());
            if (success == false)
            {
                return Json(data: new ResponseData(false, "", "Was not able to authenticate you with BankID. If you have a BankID app with a valid certificate, try again."));
            }

            // Return a response
            return Json(data: new ResponseData(success, "You were successfully authenticated!", null));

        } // End of the authentication method

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> sign(IFormCollection collection)
        {
            // Create a signature and get SSN
            Annytab.Scripts.Models.Signature signature = new Annytab.Scripts.Models.Signature();
            signature.validation_type = "BankID v5";
            signature.data = collection["txtSignatureData"];
            string personal_id = collection["txtPersonalId"];

            // Sign with bankID v5
            bool success = await this.bankid_client.Sign(personal_id, ControllerContext.HttpContext.Connection.RemoteIpAddress.ToString(), signature);
            if (success == false)
            {
                return Json(data: new ResponseData(false, "", "The file could not be signed with BankID. If you have a BankID app with a valid certificate, try again."));
            }

            // Return a response
            return Json(data: new ResponseData(success, "Signature was successfully created!", signature.value));

        } // End of the sign method

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult validate(IFormCollection collection)
        {
            // Create a signature
            Annytab.Scripts.Models.Signature signature = new Annytab.Scripts.Models.Signature();
            signature.validation_type = "BankID v5";
            signature.data = collection["txtSignatureData"];
            signature.value = collection["txtSignatureValue"];

            // Validate the signature
            SignatureValidationResult result = this.bankid_client.Validate(signature.value);

            // Set a title and a message
            string title = result.valid == false ? "Invalid Signature" : "Valid Signature";
            string message = "<b>" + title + "</b><br />" + result.signature_data + "<br />";
            message += result.certificate != null ? result.certificate.GetNameInfo(X509NameType.SimpleName, false) + ", " + result.certificate.GetNameInfo(X509NameType.SimpleName, true)
                + ", " + result.certificate.NotBefore.ToString("yyyy-MM-dd") + " to "
                + result.certificate.NotAfter.ToString("yyyy-MM-dd") : "";

            // Return a response
            return Json(data: new ResponseData(result.valid, title, message));

        } // End of the validate method

        #endregion

    } // End of the class

} // End of the namespace
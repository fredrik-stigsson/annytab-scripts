using System;
using System.Text;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Annytab.Scripts.Models;

namespace Annytab.Scripts.Controllers
{
    public class eidsmartcardController : Controller
    {
        #region Variables

        private readonly ILogger logger;

        #endregion

        #region Constructors

        public eidsmartcardController(ILogger<eidsmartcardController> logger)
        {
            // Set values for instance variables
            this.logger = logger;

        } // End of the constructor

        #endregion

        #region Post methods

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult validate(IFormCollection collection)
        {
            // Create a signature
            Annytab.Scripts.Models.Signature signature = new Annytab.Scripts.Models.Signature();
            signature.validation_type = "eID Smart Card";
            signature.algorithm = collection["selectSignatureAlgorithm"];
            signature.padding = collection["selectSignaturePadding"];
            signature.data = collection["txtSignatureData"];
            signature.value = collection["txtSignatureValue"];
            signature.certificate = collection["txtSignatureCertificate"];

            // Validate the signature
            SignatureValidationResult result = ValidateSignature(signature);

            // Set a title and a message
            string title = result.valid == false ? "Invalid Signature" : "Valid Signature";
            string message = "<b>" + title + "</b><br />" + signature.data + "<br />";
            message += result.certificate != null ? result.certificate.GetNameInfo(X509NameType.SimpleName, false) + ", " + result.certificate.GetNameInfo(X509NameType.SimpleName, true)
                + ", " + result.certificate.NotBefore.ToString("yyyy-MM-dd") + " to "
                + result.certificate.NotAfter.ToString("yyyy-MM-dd") : "";

            // Return a response
            return Json(data: new ResponseData(result.valid, title, message));

        } // End of the validate method

        #endregion

        #region Helper methods

        public static IDictionary<string, string> GetHashDictionary(byte[] data)
        {
            // Create the dictionary to return
            IDictionary<string, string> hashes = new Dictionary<string, string>(4);

            using (SHA1 sha = SHA1.Create())
            {
                hashes.Add("SHA-1", GetHexString(sha.ComputeHash(data)));
            }

            using (SHA256 sha = SHA256.Create())
            {
                hashes.Add("SHA-256", GetHexString(sha.ComputeHash(data)));
            }

            using (SHA384 sha = SHA384.Create())
            {
                hashes.Add("SHA-384", GetHexString(sha.ComputeHash(data)));
            }

            using (SHA512 sha = SHA512.Create())
            {
                hashes.Add("SHA-512", GetHexString(sha.ComputeHash(data)));
            }

            // Return the dictionary
            return hashes;

        } // End of the GetHashDictionary method

        public static string GetHexString(byte[] data)
        {
            // Create a new Stringbuilder to collect the bytes and create a string.
            StringBuilder sBuilder = new StringBuilder();

            // Loop through each byte of the hashed data and format each one as a hexadecimal string.
            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }

            // Return the hexadecimal string.
            return sBuilder.ToString();

        } // End of the GetHexString method

        public static HashAlgorithmName GetHashAlgorithmName(string signature_algorithm)
        {
            if (signature_algorithm == "SHA-256")
            {
                return HashAlgorithmName.SHA256;
            }
            else if (signature_algorithm == "SHA-384")
            {
                return HashAlgorithmName.SHA384;
            }
            else if (signature_algorithm == "SHA-512")
            {
                return HashAlgorithmName.SHA512;
            }
            else
            {
                return HashAlgorithmName.SHA1;
            }

        } // End of the GetHashAlgorithmName method

        public static RSASignaturePadding GetRSASignaturePadding(string signature_padding)
        {
            if (signature_padding == "Pss")
            {
                return RSASignaturePadding.Pss;
            }
            else
            {
                return RSASignaturePadding.Pkcs1;
            }

        } // End of the GetRSASignaturePadding method

        public static SignatureValidationResult ValidateSignature(Annytab.Scripts.Models.Signature signature)
        {
            // Create the result to return
            SignatureValidationResult result = new SignatureValidationResult();
            result.signature_data = signature.data;

            try
            {
                // Get the certificate
                result.certificate = new X509Certificate2(Convert.FromBase64String(signature.certificate));

                // Get the public key
                using (RSA rsa = result.certificate.GetRSAPublicKey())
                {
                    // Convert the signature value to a byte array
                    byte[] digest = Convert.FromBase64String(signature.value);

                    // Check if the signature is valid
                    result.valid = rsa.VerifyData(Encoding.UTF8.GetBytes(signature.data), digest, GetHashAlgorithmName(signature.algorithm), GetRSASignaturePadding(signature.padding));
                }
            }
            catch (Exception ex)
            {
                string exMessage = ex.Message;
                result.certificate = null;
            }

            // Return the validation result
            return result;

        } // End of the ValidateSignature method

        #endregion

    } // End of the class

} // End of the namespace
using System;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Annytab.Scripts.Models;

namespace Annytab.Scripts
{
    public class FrejaClient : IFrejaClient
    {
        #region Variables

        private readonly HttpClient client;
        private readonly FrejaOptions options;
        private readonly ILogger logger;

        #endregion

        #region Constructors

        public FrejaClient(HttpClient http_client, IOptions<FrejaOptions> options, ILogger<IFrejaClient> logger)
        {
            // Set values for instance variables
            this.client = http_client;
            this.options = options.Value;
            this.logger = logger;

            // Set values for the client
            this.client.BaseAddress = new Uri(this.options.BaseAddress);
            this.client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            
        } // End of the constructor

        #endregion

        #region Authentication

        public async Task<bool> Authenticate(string userInfoType, string userInfo)
        {
            // Variables
            StringContent content = null;
            FrejaStatusResponse status_response = null;

            try
            {
                // Create a request
                FrejaRequest request = new FrejaRequest
                {
                    userInfoType = userInfoType,
                    userInfo = userInfo,
                    minRegistrationLevel = "PLUS", // BASIC, EXTENDED or PLUS
                    attributesToReturn = new List<AttributesToReturnItem>
                    {
                        new AttributesToReturnItem
                        {
                            attribute = "BASIC_USER_INFO",
                        },
                        new AttributesToReturnItem
                        {
                            attribute = "EMAIL_ADDRESS",
                        },
                        new AttributesToReturnItem
                        {
                            attribute = "DATE_OF_BIRTH",
                        },
                        new AttributesToReturnItem
                        {
                            attribute = "ADDRESSES",
                        },
                        new AttributesToReturnItem
                        {
                            attribute = "SSN",
                        }
                    }
                };

                // Set serializer options
                var json_options = new JsonSerializerOptions
                {
                    IgnoreNullValues = true,
                    WriteIndented = true,
                    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };

                // Convert request to json
                string json = JsonSerializer.Serialize(request, json_options);

                // Create string content
                content = new StringContent("initAuthRequest=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));
                content.Headers.ContentType.MediaType = "application/json";
                content.Headers.ContentType.CharSet = "utf-8";

                // Get the response
                HttpResponseMessage response = await client.PostAsync("/authentication/1.0/initAuthentication", content);

                // Check the status code for the response
                if (response.IsSuccessStatusCode == true)
                {
                    // Get string data
                    json = await response.Content.ReadAsStringAsync();

                    // Add content
                    content = new StringContent("getOneAuthResultRequest=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));
                    content.Headers.ContentType.MediaType = "application/json";
                    content.Headers.ContentType.CharSet = "utf-8";

                    // Wait for authentication
                    Int32 timeout = this.options.TimeoutInMilliseconds.GetValueOrDefault();
                    while (true)
                    {
                        // Check for a timeout
                        if (timeout <= 0)
                        {
                            // Cancel the order and return false
                            content = new StringContent("cancelAuthRequest=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));
                            content.Headers.ContentType.MediaType = "application/json";
                            content.Headers.ContentType.CharSet = "utf-8";
                            response = await client.PostAsync("/authentication/1.0/cancel", content);
                            return false;
                        }

                        // Sleep for 2 seconds
                        await Task.Delay(2000);
                        timeout -= 2000;

                        // Collect a signature
                        response = await client.PostAsync("/authentication/1.0/getOneResult", content);

                        // Check the status code for the response
                        if (response.IsSuccessStatusCode == true)
                        {
                            // Get string data
                            string data = await response.Content.ReadAsStringAsync();

                            // Convert data to a bankid response
                            status_response = JsonSerializer.Deserialize<FrejaStatusResponse>(data);

                            if (status_response.status == "APPROVED")
                            {
                                // Break out from the loop
                                break;

                            }
                            else if (status_response.status == "STARTED" || status_response.status == "DELIVERED_TO_MOBILE"
                                || status_response.status == "OPENED" || status_response.status == "OPENED")
                            {
                                // Continue to loop
                                continue;
                            }
                            else
                            {
                                    // CANCELED, RP_CANCELED, EXPIRED or REJECTED
                                    return false;
                            }
                        }
                        else
                        {
                            // Get string data
                            string data = await response.Content.ReadAsStringAsync();

                            // Return false
                            return false;
                        }
                    }
                }
                else
                {
                    // Get string data
                    string data = await response.Content.ReadAsStringAsync();

                    // Log the error
                    this.logger.LogError($"Authenticate: {data}");

                    // Return false
                    return false;
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                this.logger.LogInformation(ex, $"Authenticate: {status_response.details}", null);

                // Return false
                return false;
            }
            finally
            {
                if (content != null)
                {
                    content.Dispose();
                }
            }

            // Return success
            return true;

        } // End of the Authenticate method

        #endregion

        #region Signatures

        public async Task<bool> Sign(string userInfoType, string userInfo, Annytab.Scripts.Models.Signature signature)
        {
            // Variables
            StringContent content = null;
            FrejaStatusResponse status_response = null;

            try
            {
                // Create a request
                FrejaRequest request = new FrejaRequest
                {
                    userInfoType = userInfoType,
                    userInfo = userInfo,
                    minRegistrationLevel = "BASIC", // BASIC, EXTENDED or PLUS
                    title = "Sign File",
                    pushNotification = new PushNotification // Can not include swedish characters å,ä,ö
                    {
                        title = "Hello - Hallå",
                        text = "Please sign this file - Signera denna fil"
                    },
                    expiry = (Int64)DateTime.UtcNow.AddMinutes(5).Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds,
                    //expiry = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeMilliseconds(),
                    dataToSignType = "SIMPLE_UTF8_TEXT",
                    dataToSign = new DataToSign { text = Convert.ToBase64String(Encoding.UTF8.GetBytes(signature.data)) },
                    signatureType = "SIMPLE",
                    attributesToReturn = new List<AttributesToReturnItem>
                    {
                        //new AttributesToReturnItem
                        //{
                        //    attribute = "BASIC_USER_INFO",
                        //},
                        new AttributesToReturnItem
                        {
                            attribute = "EMAIL_ADDRESS",
                        },
                        //new AttributesToReturnItem
                        //{
                        //    attribute = "DATE_OF_BIRTH",
                        //},
                        //new AttributesToReturnItem
                        //{
                        //    attribute = "ADDRESSES",
                        //},
                        //new AttributesToReturnItem
                        //{
                        //    attribute = "SSN",
                        //}
                    }
                };

                // Set serializer options
                var json_options = new JsonSerializerOptions
                {
                    IgnoreNullValues = true,
                    WriteIndented = true,
                    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };

                // Convert request to json
                string json = JsonSerializer.Serialize(request, json_options);

                // Create string content
                content = new StringContent("initSignRequest=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));
                content.Headers.ContentType.MediaType = "application/json";
                content.Headers.ContentType.CharSet = "utf-8";

                // Get the response
                HttpResponseMessage response = await client.PostAsync("/sign/1.0/initSignature", content);

                // Check the status code for the response
                if (response.IsSuccessStatusCode == true)
                {
                    // Get string data
                    json = await response.Content.ReadAsStringAsync();

                    // Add content
                    content = new StringContent("getOneSignResultRequest=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));
                    content.Headers.ContentType.MediaType = "application/json";
                    content.Headers.ContentType.CharSet = "utf-8";

                    // Collect the signature
                    Int32 timeout = this.options.TimeoutInMilliseconds.GetValueOrDefault();
                    while (true)
                    {
                        // Check for a timeout
                        if (timeout <= 0)
                        {
                            // Cancel the order and return false
                            content = new StringContent("cancelSignRequest=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));
                            content.Headers.ContentType.MediaType = "application/json";
                            content.Headers.ContentType.CharSet = "utf-8";
                            response = await client.PostAsync("/sign/1.0/cancel", content);
                            return false;
                        }

                        // Sleep for 2 seconds
                        await Task.Delay(2000);
                        timeout -= 2000;

                        // Collect a signature
                        response = await client.PostAsync("/sign/1.0/getOneResult", content);

                        // Check the status code for the response
                        if (response.IsSuccessStatusCode == true)
                        {
                            // Get string data
                            string data = await response.Content.ReadAsStringAsync();

                            // Convert data to a bankid response
                            status_response = JsonSerializer.Deserialize<FrejaStatusResponse>(data);

                            if (status_response.status == "APPROVED")
                            {
                                // Break out from the loop
                                break;
                                
                            }
                            else if (status_response.status == "STARTED" || status_response.status == "DELIVERED_TO_MOBILE" 
                                || status_response.status == "OPENED" || status_response.status == "OPENED")
                            {
                                // Continue to loop
                                continue;
                            }
                            else
                            {
                                // CANCELED, RP_CANCELED or EXPIRED
                                return false;
                            }
                        }
                        else
                        {
                            // Get string data
                            string data = await response.Content.ReadAsStringAsync();

                            // Return false
                            return false;
                        }
                    }
                }
                else
                {
                    // Get string data
                    string data = await response.Content.ReadAsStringAsync();

                    // Log the error
                    this.logger.LogError($"Sign: {data}");

                    // Return false
                    return false;
                }

                // Update the signature
                signature.algorithm = "SHA-256";
                signature.padding = "Pkcs1";
                signature.value = status_response.details;
                signature.certificate = this.options.JwsCertificate;
            }
            catch (Exception ex)
            {
                // Log the exception
                this.logger.LogInformation(ex, $"Sign: {signature.value}", null);

                // Return false
                return false;
            }
            finally
            {
                if (content != null)
                {
                    content.Dispose();
                }
            }

            // Return success
            return true;

        } // End of the Sign method

        public SignatureValidationResult Validate(Annytab.Scripts.Models.Signature signature)
        {
            // Create the result to return
            SignatureValidationResult result = new SignatureValidationResult();
            result.signature_data = signature.data;

            // Get JWS data (signed by Freja)
            string[] jws = signature.value.Split('.');
            byte[] data = Encoding.UTF8.GetBytes(jws[0] + "." + jws[1]);
            byte[] digest = WebEncoders.Base64UrlDecode(jws[2]);

            // Get payload data
            FrejaPayload payload = JsonSerializer.Deserialize<FrejaPayload>(Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(jws[1])));
            result.signatory = payload.userInfoType + ": " + payload.userInfo;
            string[] user_signature = payload.signatureData.userSignature.Split('.');
            string signed_data = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(user_signature[1]));

            try
            {
                // Get the certificate
                result.certificate = new X509Certificate2(Convert.FromBase64String(signature.certificate));

                // Get the public key
                using (RSA rsa = result.certificate.GetRSAPublicKey())
                {
                    // Check if the signature is valid
                    result.valid = rsa.VerifyData(data, digest, GetHashAlgorithmName(signature.algorithm), GetRSASignaturePadding(signature.padding));
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                this.logger.LogInformation(ex, $"Validate: {signature.value}", null);
            }

            // Make sure that signature data conforms
            if(signature.data != signed_data)
            {
                result.valid = false;
            }

            // Return the validation result
            return result;

        } // End of the Validate method

        #endregion

        #region Helpers

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

        #endregion

    } // End of the class

} // End of the namespace
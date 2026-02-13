using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Xml;
using System.Xml.Serialization;
using System.Threading.Tasks;
using System.Security.Cryptography.Xml;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Annytab.Scripts.Models;

namespace Annytab.Scripts
{
    public class BankIdClient : IBankIdClient
    {
        #region Variables

        private readonly HttpClient client;
        private readonly BankIdOptions options;
        private readonly ILogger logger;

        #endregion

        #region Constructors

        public BankIdClient(HttpClient http_client, IOptions<BankIdOptions> options, ILogger<IBankIdClient> logger)
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

        public async Task<bool> Authenticate(string personal_id, string ip_address)
        {
            // Variables
            StringContent content = null;
            BankidResponse bankid_response = null;

            try
            {
                // Create a json string
                string json = "{\"personalNumber\":\"" + personal_id + "\", \"endUserIp\":\"" + ip_address + "\"}";

                // Create string content
                content = new StringContent(json);
                content.Headers.ContentType = new MediaTypeWithQualityHeaderValue("application/json");

                // Get the response
                HttpResponseMessage response = await this.client.PostAsync("/rp/v5/auth", content);

                // Check the status code for the response
                if (response.IsSuccessStatusCode == true)
                {
                    // Get string data
                    string data = await response.Content.ReadAsStringAsync();

                    // Convert data to a bankid response
                    bankid_response = JsonSerializer.Deserialize<BankidResponse>(data);

                    // Create json data
                    json = "{\"orderRef\": \"" + bankid_response.orderRef + "\"}";

                    // Add content
                    content = new StringContent(json);
                    content.Headers.ContentType = new MediaTypeWithQualityHeaderValue("application/json");

                    // Collect the signature
                    Int32 timeout = this.options.TimeoutInMilliseconds.GetValueOrDefault();
                    while (true)
                    {
                        // Check for a timeout
                        if (timeout <= 0)
                        {
                            // Cancel the order and return false
                            await this.client.PostAsync("/rp/v5/cancel", content);
                            return false;
                        }

                        // Sleep for 2 seconds
                        await Task.Delay(2000);
                        timeout -= 2000;

                        // Collect a signature
                        response = await this.client.PostAsync("/rp/v5/collect", content);

                        // Check the status code for the response
                        if (response.IsSuccessStatusCode == true)
                        {
                            // Get string data
                            data = await response.Content.ReadAsStringAsync();

                            // Convert data to a bankid response
                            bankid_response = JsonSerializer.Deserialize<BankidResponse>(data);

                            if (bankid_response.status == "pending")
                            {
                                // Continue to loop
                                continue;
                            }
                            else if (bankid_response.status == "failed")
                            {
                                // Return false
                                return false;
                            }
                            else
                            {
                                // Break out from the loop
                                break;
                            }
                        }
                        else
                        {
                            // Get string data
                            data = await response.Content.ReadAsStringAsync();

                            // Log the error
                            this.logger.LogError($"Authenticate: {data}");

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
                this.logger.LogInformation(ex, "Authenticate", null);
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

        public async Task<bool> Sign(string personal_id, string ip_address, Annytab.Scripts.Models.Signature signature)
        {
            // Variables
            StringContent content = null;
            BankidResponse bankid_response = null;

            try
            {
                // Create a json string
                string json = "{\"personalNumber\":\"" + personal_id + "\", \"endUserIp\":\"" + ip_address + "\", \"userVisibleData\":\"" + Convert.ToBase64String(Encoding.UTF8.GetBytes(signature.data)) + "\"}";

                // Create string content
                content = new StringContent(json);
                content.Headers.ContentType = new MediaTypeWithQualityHeaderValue("application/json");

                // Get the response
                HttpResponseMessage response = await this.client.PostAsync("/rp/v5/sign", content);

                // Check the status code for the response
                if (response.IsSuccessStatusCode == true)
                {
                    // Get string data
                    string data = await response.Content.ReadAsStringAsync();

                    // Convert data to a bankid response
                    bankid_response = JsonSerializer.Deserialize<BankidResponse>(data);

                    // Create json data
                    json = "{\"orderRef\": \"" + bankid_response.orderRef + "\"}";

                    // Add content
                    content = new StringContent(json);
                    content.Headers.ContentType = new MediaTypeWithQualityHeaderValue("application/json");

                    // Collect the signature
                    Int32 timeout = this.options.TimeoutInMilliseconds.GetValueOrDefault();
                    while (true)
                    {
                        // Check for a timeout
                        if (timeout <= 0)
                        {
                            // Cancel the order and return false
                            await client.PostAsync("/rp/v5/cancel", content);
                            return false;
                        }

                        // Sleep for 2 seconds
                        await Task.Delay(2000);
                        timeout -= 2000;

                        // Collect a signature
                        response = await client.PostAsync("/rp/v5/collect", content);

                        // Check the status code for the response
                        if (response.IsSuccessStatusCode == true)
                        {
                            // Get string data
                            data = await response.Content.ReadAsStringAsync();

                            // Convert data to a bankid response
                            bankid_response = JsonSerializer.Deserialize<BankidResponse>(data);

                            if (bankid_response.status == "pending")
                            {
                                // Continue to loop
                                continue;
                            }
                            else if (bankid_response.status == "failed")
                            {
                                // Return false
                                return false;
                            }
                            else
                            {
                                // Break out from the loop
                                break;
                            }
                        }
                        else
                        {
                            // Get string data
                            data = await response.Content.ReadAsStringAsync();

                            // Log the error
                            this.logger.LogError($"Sign: {data}");

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

                // Get the xml signature
                //string xml = Encoding.UTF8.GetString(Convert.FromBase64String(bankid_response.completionData.signature));
                //XmlSerializer serializer = new XmlSerializer(typeof(XmlSignature));
                //XmlSignature xml_signature = null;
                //using (TextReader reader = new StringReader(xml))
                //{
                //    xml_signature = (XmlSignature)serializer.Deserialize(reader);
                //}

                // Update the signature
                signature.algorithm = null;
                signature.padding = null;
                signature.value = bankid_response.completionData.signature;
                signature.certificate = null;
            }
            catch (Exception ex)
            {
                // Log the exception
                this.logger.LogInformation(ex, $"Sign: {signature.value}", null);
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

        public SignatureValidationResult Validate(string signature_value)
        {
            // Create the validation result to return
            SignatureValidationResult result = new SignatureValidationResult();

            try
            {
                // Convert from Base64
                string xml = Encoding.UTF8.GetString(Convert.FromBase64String(signature_value));

                // Create an xml document
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(xml);

                // Load the xml signature
                SignedXml signed_xml = new SignedXml();
                signed_xml.LoadXml((XmlElement)doc.GetElementsByTagName("Signature")[0]);

                // Get the xml signature
                XmlSignature xml_signature = null;
                XmlSerializer serializer = new XmlSerializer(typeof(XmlSignature));
                using (TextReader reader = new StringReader(xml))
                {
                    xml_signature = (XmlSignature)serializer.Deserialize(reader);
                }

                // Get the certificate
                result.certificate = new X509Certificate2(Convert.FromBase64String(xml_signature.KeyInfo.X509Data.X509Certificate[0]));

                // Get signature data
                result.signature_data = Encoding.UTF8.GetString(Convert.FromBase64String(xml_signature.Object.BankIdSignedData.UsrVisibleData.Text));

                // Check if the signature is valid
                result.valid = signed_xml.CheckSignature();
            }
            catch (Exception ex)
            {
                string exMessage = ex.Message;
                result.certificate = null;
            }

            // Return the validation result
            return result;

        } // End of the Validate method

        #endregion

    } // End of the class

} // End of the namespace
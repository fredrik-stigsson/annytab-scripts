using System.Security.Cryptography.X509Certificates;

namespace Annytab.Scripts.Models
{
    public class SignatureValidationResult
    {
        #region Variables

        public bool valid { get; set; }
        public string signature_data { get; set; }
        public string signatory { get; set; }
        public X509Certificate2 certificate { get; set; }

        #endregion

        #region Constructors

        public SignatureValidationResult()
        {
            // Set values for instance variables
            this.valid = false;
            this.signature_data = null;
            this.signatory = null;
            this.certificate = null;

        } // End of the constructor

        #endregion

    } // End of the class

} // End of the namespace
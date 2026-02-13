using System.Xml.Serialization;
using System.Collections.Generic;

namespace Annytab.Scripts.Models
{
    public class BankidResponse
    {
        #region Variables

        public string autoStartToken { get; set; }
        public string orderRef { get; set; }
        public string status { get; set; }
        public string hintCode { get; set; }
        public CompletionData completionData { get; set; }

        #endregion

        #region Constructors

        public BankidResponse()
        {
            // Set values for instance variables
            this.autoStartToken = null;
            this.orderRef = null;
            this.status = null;
            this.hintCode = null;
            this.completionData = null;

        } // End of the constructor

        #endregion

    } // End of the class

    public class CompletionData
    {
        #region Variables

        public string signature { get; set; }
        public string ocspResponse { get; set; }

        #endregion

        #region Constructors

        /// <summary>
        /// Create a new post with default properties
        /// </summary>
        public CompletionData()
        {
            // Set values for instance variables
            this.signature = null;
            this.ocspResponse = null;

        } // End of the constructor

        #endregion

    } // End of the class

    [XmlRoot(ElementName = "CanonicalizationMethod", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class CanonicalizationMethod
    {
        [XmlAttribute(AttributeName = "Algorithm")]
        public string Algorithm { get; set; }
    }

    [XmlRoot(ElementName = "SignatureMethod", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class SignatureMethod
    {
        [XmlAttribute(AttributeName = "Algorithm")]
        public string Algorithm { get; set; }
    }

    [XmlRoot(ElementName = "Transform", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class Transform
    {
        [XmlAttribute(AttributeName = "Algorithm")]
        public string Algorithm { get; set; }
    }

    [XmlRoot(ElementName = "Transforms", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class Transforms
    {
        [XmlElement(ElementName = "Transform", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public Transform Transform { get; set; }
    }

    [XmlRoot(ElementName = "DigestMethod", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class DigestMethod
    {
        [XmlAttribute(AttributeName = "Algorithm")]
        public string Algorithm { get; set; }
    }

    [XmlRoot(ElementName = "Reference", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class Reference
    {
        [XmlElement(ElementName = "Transforms", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public Transforms Transforms { get; set; }
        [XmlElement(ElementName = "DigestMethod", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public DigestMethod DigestMethod { get; set; }
        [XmlElement(ElementName = "DigestValue", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public string DigestValue { get; set; }
        [XmlAttribute(AttributeName = "URI")]
        public string URI { get; set; }
        [XmlAttribute(AttributeName = "Type")]
        public string Type { get; set; }
    }

    [XmlRoot(ElementName = "SignedInfo", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class SignedInfo
    {
        [XmlElement(ElementName = "CanonicalizationMethod", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public CanonicalizationMethod CanonicalizationMethod { get; set; }
        [XmlElement(ElementName = "SignatureMethod", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public SignatureMethod SignatureMethod { get; set; }
        [XmlElement(ElementName = "Reference", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public List<Reference> Reference { get; set; }
        [XmlAttribute(AttributeName = "xmlns")]
        public string Xmlns { get; set; }
    }

    [XmlRoot(ElementName = "X509Data", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class X509Data
    {
        [XmlElement(ElementName = "X509Certificate", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public List<string> X509Certificate { get; set; }
    }

    [XmlRoot(ElementName = "KeyInfo", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class KeyInfo
    {
        [XmlElement(ElementName = "X509Data", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public X509Data X509Data { get; set; }
        [XmlAttribute(AttributeName = "xmlns")]
        public string Xmlns { get; set; }
        [XmlAttribute(AttributeName = "Id")]
        public string Id { get; set; }
    }

    [XmlRoot(ElementName = "usrVisibleData", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class UsrVisibleData
    {
        [XmlAttribute(AttributeName = "visible")]
        public string Visible { get; set; }
        [XmlAttribute(AttributeName = "charset")]
        public string Charset { get; set; }
        [XmlText]
        public string Text { get; set; }
    }

    [XmlRoot(ElementName = "srvInfo", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class SrvInfo
    {
        [XmlElement(ElementName = "name", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Name { get; set; }
        [XmlElement(ElementName = "nonce", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Nonce { get; set; }
        [XmlElement(ElementName = "displayName", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string DisplayName { get; set; }
    }

    [XmlRoot(ElementName = "condition", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class Condition
    {
        [XmlElement(ElementName = "type", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Type { get; set; }
        [XmlElement(ElementName = "value", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Value { get; set; }
    }

    [XmlRoot(ElementName = "requirement", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class Requirement
    {
        [XmlElement(ElementName = "condition", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public Condition Condition { get; set; }
    }

    [XmlRoot(ElementName = "ai", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class Ai
    {
        [XmlElement(ElementName = "type", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Type { get; set; }
        [XmlElement(ElementName = "deviceInfo", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string DeviceInfo { get; set; }
        [XmlElement(ElementName = "uhi", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Uhi { get; set; }
        [XmlElement(ElementName = "fsib", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Fsib { get; set; }
        [XmlElement(ElementName = "utb", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Utb { get; set; }
        [XmlElement(ElementName = "requirement", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public Requirement Requirement { get; set; }
        [XmlElement(ElementName = "uauth", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Uauth { get; set; }
    }

    [XmlRoot(ElementName = "env", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class Env
    {
        [XmlElement(ElementName = "ai", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public Ai Ai { get; set; }
    }

    [XmlRoot(ElementName = "clientInfo", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class ClientInfo
    {
        [XmlElement(ElementName = "funcId", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string FuncId { get; set; }
        [XmlElement(ElementName = "version", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public string Version { get; set; }
        [XmlElement(ElementName = "env", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public Env Env { get; set; }
    }

    [XmlRoot(ElementName = "bankIdSignedData", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
    public class BankIdSignedData
    {
        [XmlElement(ElementName = "usrVisibleData", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public UsrVisibleData UsrVisibleData { get; set; }
        [XmlElement(ElementName = "srvInfo", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public SrvInfo SrvInfo { get; set; }
        [XmlElement(ElementName = "clientInfo", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public ClientInfo ClientInfo { get; set; }
        [XmlAttribute(AttributeName = "xmlns")]
        public string Xmlns { get; set; }
        [XmlAttribute(AttributeName = "Id")]
        public string Id { get; set; }
    }

    [XmlRoot(ElementName = "Object", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class Object
    {
        [XmlElement(ElementName = "bankIdSignedData", Namespace = "http://www.bankid.com/signature/v1.0.0/types")]
        public BankIdSignedData BankIdSignedData { get; set; }
    }

    [XmlRoot(ElementName = "Signature", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
    public class XmlSignature
    {
        [XmlElement(ElementName = "SignedInfo", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public SignedInfo SignedInfo { get; set; }
        [XmlElement(ElementName = "SignatureValue", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public string SignatureValue { get; set; }
        [XmlElement(ElementName = "KeyInfo", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public KeyInfo KeyInfo { get; set; }
        [XmlElement(ElementName = "Object", Namespace = "http://www.w3.org/2000/09/xmldsig#")]
        public Object Object { get; set; }
        [XmlAttribute(AttributeName = "xmlns")]
        public string Xmlns { get; set; }
    }

} // End of the namespace
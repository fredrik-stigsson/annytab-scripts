using System;
using System.Collections.Generic;

namespace Annytab.Scripts
{
    public class DataToSign
    {
        public string text { get; set; }
        public string binaryData { get; set; }

    } // End of the class

    public class PushNotification
    {
        public string title { get; set; }
        public string text { get; set; }

    } // End of the class

    public class AttributesToReturnItem
    {
        public string attribute { get; set; }

    } // End of the class

    public class FrejaRequest
    {
        public string userInfoType { get; set; }
        public string userInfo { get; set; }
        public string minRegistrationLevel { get; set; }
        public string title { get; set; }
        public PushNotification pushNotification { get; set; }
        public Int64? expiry { get; set; }
        public string dataToSignType { get; set; }
        public DataToSign dataToSign { get; set; }
        public string signatureType { get; set; }
        public IList<AttributesToReturnItem> attributesToReturn { get; set; }

    } // End of the class

    public class BasicUserInfo
    {
        public string name { get; set; }
        public string surname { get; set; }

    } // End of the class

    public class AddressesItem
    {
        public string country { get; set; }
        public string city { get; set; }
        public string postCode { get; set; }
        public string address1 { get; set; }
        public string address2 { get; set; }
        public string address3 { get; set; }
        public string validFrom { get; set; }
        public string type { get; set; }
        public string sourceType { get; set; }

    } // End of the class

    public class Ssn
    {
        public string ssn { get; set; }
        public string country { get; set; }

    } // End of the class

    public class RequestedAttributes
    {
        public BasicUserInfo basicUserInfo { get; set; }
        public string emailAddress { get; set; }
        public string dateOfBirth { get; set; }
        public List<AddressesItem> addresses { get; set; }
        public Ssn ssn { get; set; }
        public string relyingPartyUserId { get; set; }
        public string integratorSpecificUserId { get; set; }
        public string customIdentifier { get; set; }

    } // End of the class

    public class FrejaStatusResponse
    {
        public string authRef { get; set; }
        public string signRef { get; set; }
        public string status { get; set; }
        public string details { get; set; }
        public RequestedAttributes requestedAttributes { get; set; }

    } // End of the class

    public class FrejaResponseHeader
    {
        public string x5t { get; set; }
        public string alg { get; set; }

    } // End of the class

    public class FrejaPayload
    {
        public string authRef { get; set; }
        public string signRef { get; set; }
        public string status { get; set; }
        public string userInfoType { get; set; }
        public string userInfo { get; set; }
        public string minRegistrationLevel { get; set; }
        public RequestedAttributes requestedAttributes { get; set; }
        public string signatureType { get; set; }
        public SignatureData signatureData { get; set; }
        public Int64? timestamp { get; set; }

    } // End of the class

    public class SignatureData
    {
        public string userSignature { get; set; }
        public string certificateStatus { get; set; }

    } // End of the class

} // End of the namespace
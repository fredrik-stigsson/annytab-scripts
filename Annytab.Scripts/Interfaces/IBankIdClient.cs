using System.Threading.Tasks;
using Annytab.Scripts.Models;

namespace Annytab.Scripts
{
    public interface IBankIdClient
    {
        Task<bool> Authenticate(string personal_id, string ip_address);
        Task<bool> Sign(string personal_id, string ip_address, Annytab.Scripts.Models.Signature signature);
        SignatureValidationResult Validate(string signature_value);

    } // End of the interface

} // End of the namespace
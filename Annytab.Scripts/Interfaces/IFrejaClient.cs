using System.Threading.Tasks;
using Annytab.Scripts.Models;

namespace Annytab.Scripts
{
    public interface IFrejaClient
    {
        Task<bool> Authenticate(string userInfoType, string userInfo);
        Task<bool> Sign(string userInfoType, string userInfo, Annytab.Scripts.Models.Signature signature);
        SignatureValidationResult Validate(Signature signature);

    } // End of the interface

} // End of the namespace
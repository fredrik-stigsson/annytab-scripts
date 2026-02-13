using System;

namespace Annytab.Scripts
{
    public class FrejaOptions
    {
        #region Variables

        public string BaseAddress { get; set; }
        public string JwsCertificate { get; set; }
        public Int32? TimeoutInMilliseconds { get; set; }

        #endregion

        #region Constructors

        public FrejaOptions()
        {
            // Set values for instance variables
            this.BaseAddress = null;
            this.JwsCertificate = null;
            this.TimeoutInMilliseconds = null;

        } // End of the constructor

        #endregion

    } // End of the class

} // End of the namespace
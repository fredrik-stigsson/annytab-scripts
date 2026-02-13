using System;

namespace Annytab.Scripts
{
    public class BankIdOptions
    {
        #region Variables

        public string BaseAddress { get; set; }
        public Int32? TimeoutInMilliseconds { get; set; }

        #endregion

        #region Constructors

        public BankIdOptions()
        {
            // Set values for instance variables
            this.BaseAddress = null;
            this.TimeoutInMilliseconds = null;

        } // End of the constructor

        #endregion

    } // End of the class

} // End of the namespace
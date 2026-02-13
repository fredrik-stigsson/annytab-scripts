namespace Annytab.Scripts.Models
{
    public class Signature
    {
        #region Variables

        public string validation_type { get; set; }
        public string algorithm { get; set; }
        public string padding { get; set; }
        public string data { get; set; }
        public string value { get; set; }
        public string certificate { get; set; }

        #endregion

        #region Constructors

        public Signature()
        {
            // Set values for instance variables
            this.validation_type = null;
            this.algorithm = null;
            this.padding = null;
            this.data = null;
            this.value = null;
            this.certificate = null;

        } // End of the constructor

        #endregion

    } // End of the class

} // End of the namespace
namespace Annytab.Scripts.Models
{
    public class ResponseData
    {
        #region variables

        public bool success { get; set; }
        public string id { get; set; }
        public string message { get; set; }
        public string url { get; set; }

        #endregion

        #region Constructors

        public ResponseData()
        {
            // Set values for instance variables
            this.success = false;
            this.id = "";
            this.message = "";
            this.url = "";

        } // End of the constructor

        public ResponseData(bool success, string id, string message, string url = "")
        {
            // Set values for instance variables
            this.success = success;
            this.id = id;
            this.message = message;
            this.url = url;

        } // End of the constructor

        #endregion

    } // End of the class

} // End of the namespace
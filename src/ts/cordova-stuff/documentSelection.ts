
/**
 * File selection and information about the selected file
 */
class DocumentSelection {

    /** URI for the selected file (content://blahblah...) */
    public uri : string;

    /** Selected file name */
    public fileName : string;

    /** Selected mime type */
    public mimeType : string;

    public copyTo( parent : any ) : Promise<void> {

        
        return null;
    }

    /**
     * Select a document from the UI, and get info about it
     * @returns Promise with the selected file
     */
    public static selectDocument() : JQueryPromise<DocumentSelection> {
        const dfd = jQuery.Deferred<DocumentSelection>();

        DocumentSelection.selectDocumentWithUI()
        .then( function(uri : string) {
            return DocumentSelection.getDocumentInfo(uri);
        })
        .then( 
            function(doc : DocumentSelection ) { dfd.resolve(doc); },
            function( error ) { dfd.reject(error); }
        );
        return dfd.promise();
    }

    private static selectDocumentWithUI() : JQueryPromise<string> {
        const dfd = jQuery.Deferred<string>();
        fileChooser.open(function(uri) {
            dfd.resolve(uri);
        });
        return dfd.promise();
    }

    /**
     * Get information about a selected document
     * @param uri The selected document URI
     * @returns Promise with the document info
     */
    private static getDocumentInfo(uri : string) : JQueryPromise<DocumentSelection> {
        const dfd = jQuery.Deferred<DocumentSelection>();

        // OK, a weird exception. If uri is "file://...", getContract fails...
        if( uri.toLowerCase().startsWith('file://') ) {
            const doc = new DocumentSelection();
            doc.fileName = uri.split('/').pop();
            if( !doc.fileName )
                doc.fileName = 'Unknown';
            doc.mimeType = 'Unknown';
            doc.uri = uri;
            return dfd.resolve(doc).promise();
        }

        window.plugins.DocumentContract.getContract(
            {
                uri: uri,
                columns: [
                    '_display_name', 'mime_type'
                ]
            },
            function(contract) {
                const doc = new DocumentSelection();
                doc.fileName = contract['_display_name'];
                doc.mimeType = contract['mime_type'];
                doc.uri = uri;
                dfd.resolve(doc);
            },
            function(error) {
                dfd.reject( error );
            }
        );
        return dfd.promise();
    }

}
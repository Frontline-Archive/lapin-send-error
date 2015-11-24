'use strict';

function sendError ( send, error, newCode ) {
	var code;
	var codes = [];

	function addCode ( additionalCode ) {
		if ( additionalCode ) {
			codes.push( additionalCode );
		}
	}

	addCode( error.code );
	addCode( newCode );

	code = codes.join( ',' );
	code = code || undefined;

	// Check to see if it's a JSend object
	if ( error.status ) {
		// Passing along JSend fail messages
		if ( error.status === 'fail' ) {
			return send.fail( error.data );
		}

		// Keep from double nesting error data
		if ( error.data ) {
			return send.error( error.message, error.data, code );
		}
	}

	// Send entire error as data if no data has been established
	send.error( error.message, error, code );
}

module.exports = sendError;

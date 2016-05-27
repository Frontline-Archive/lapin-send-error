'use strict';

/* eslint no-unused-expressions:0 */

const _         = require( 'lodash' );
const lapinMock = require( 'lapin-mock' );

require( 'should' );

describe( '@sinet/lapin-send-error', function () {
	let handleError, sendMock, error;

	before( function () {
		handleError = require( process.cwd() );
	} );

	describe( '-- handle standard error with stack', function () {
		before( function ( done ) {
			error    = new Error( 'Something went wrong' );
			sendMock = new lapinMock.SendMock( done );

			handleError( sendMock, error );
		} );

		it( 'should return correct information', function () {
			sendMock.should.have.property( 'errorMessage' ).and.equal( 'Something went wrong' );
			sendMock.should.have.property( 'error' ).and.equal( error.stack );
		} );
	} );

	describe( '-- handle JSend fail', function () {
		before( function ( done ) {
			error = {
				'status' : 'fail',
				'data'   : 'Something went wrong'
			};

			sendMock = new lapinMock.SendMock( done );

			handleError( sendMock, error );
		} );

		it( 'should return correct information', function () {
			sendMock.should.have.property( 'errorMessage' ).and.equal( 'Something went wrong' );
		} );
	} );

	describe( '-- handle JSend error', function () {
		const baseError = {
			'status' : 'error'
		};

		describe( '-- error with data', function () {
			before( function ( done ) {
				error = _.defaults( {
					'message' : 'Some error',
					'data'    : 'Some data'
				}, baseError );

				sendMock = new lapinMock.SendMock( done );

				handleError( sendMock, error );
			} );

			it( 'should not duplicate data', function () {
				sendMock.should.have.property( 'errorMessage' ).and.equal( 'Some error' );
				sendMock.should.have.property( 'error' ).and.equal( error.data );
				sendMock.should.have.property( 'code' ).and.equal( undefined );
			} );
		} );

		describe( '-- error with no codes', function () {
			before( function ( done ) {
				error    = _.defaults( { 'message' : 'Some error' }, baseError );
				sendMock = new lapinMock.SendMock( done );

				handleError( sendMock, error );
			} );

			it( 'should not have a code defined', function () {
				sendMock.should.have.property( 'errorMessage' ).and.equal( 'Some error' );
				sendMock.should.have.property( 'error' ).and.equal( error );
				sendMock.should.have.property( 'code' ).and.equal( undefined );
			} );
		} );

		describe( '-- error with new code', function () {
			before( function ( done ) {
				error    = _.defaults( { 'message' : 'Error with code' }, baseError );
				sendMock = new lapinMock.SendMock( done );

				handleError( sendMock, error, 'code' );
			} );

			it( 'should have new error code', function () {
				sendMock.should.have.property( 'errorMessage' ).and.equal( 'Error with code' );
				sendMock.should.have.property( 'error' ).and.equal( error );
				sendMock.should.have.property( 'code' ).and.equal( 'code' );
			} );
		} );

		describe( '-- error with existing code', function () {
			before( function ( done ) {
				error = _.defaults( {
					'message' : 'Error with existing code',
					'code'    : 'existing'
				}, baseError );

				sendMock = new lapinMock.SendMock( done );

				handleError( sendMock, error );
			} );

			it( 'should have existing error code', function () {
				sendMock.should.have.property( 'errorMessage' ).and.equal( 'Error with existing code' );
				sendMock.should.have.property( 'error' ).and.equal( error );
				sendMock.should.have.property( 'code' ).and.equal( 'existing' );
			} );
		} );

		describe( '-- error with new and existing code', function () {
			before( function ( done ) {
				error = _.defaults( {
					'message' : 'Error with existing code',
					'code'    : 'existing'
				}, baseError );

				sendMock = new lapinMock.SendMock( done );

				handleError( sendMock, error, 'new' );
			} );

			it( 'should have `existing,new` error code', function () {
				sendMock.should.have.property( 'errorMessage' ).and.equal( 'Error with existing code' );
				sendMock.should.have.property( 'error' ).and.equal( error );
				sendMock.should.have.property( 'code' ).and.equal( 'existing,new' );
			} );
		} );

		describe( '-- error that is just a string', function () {
			before( function ( done ) {
				error    = 'Error with existing code';
				sendMock = new lapinMock.SendMock( done );

				handleError( sendMock, error );
			} );

			it( 'should have have the error be the message and data', function () {
				sendMock.should.have.property( 'errorMessage' ).and.equal( error );
				sendMock.should.have.property( 'error' ).and.equal( error );
			} );
		} );
	} );
} );

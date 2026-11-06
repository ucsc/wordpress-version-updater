#!/usr/bin/env node
/**
 * Command line interface.
 *
 *     wordpress-version-updater check <file>
 *
 * Reads the version from the `Version:` line of <file>. Exits with code 0 if
 * it can read the version, and with code 1 if it cannot. It writes nothing to
 * stdout, because commit-and-tag-version can use the stdout of a lifecycle
 * script. Errors go to stderr.
 */
const fs = require( 'node:fs' );
const { readVersion } = require( './index.js' );

const usage = 'Usage: wordpress-version-updater check <file>';

function fail( message ) {
	process.stderr.write( `wordpress-version-updater: ${ message }\n` );
	process.exit( 1 );
}

const [ command, file, ...rest ] = process.argv.slice( 2 );

if ( command !== 'check' || ! file || rest.length > 0 ) {
	fail( usage );
}

let contents;
try {
	contents = fs.readFileSync( file, 'utf8' );
} catch ( error ) {
	fail( `Cannot read "${ file }": ${ error.message }` );
}

// readVersion stops the process with code 1 if there is no Version line.
readVersion( contents );

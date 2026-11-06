/**
 * Failure tests.
 *
 * On failure the code calls `process.exit( 1 )`, so each test runs the code
 * in a child process and examines the exit code, stdout and stderr.
 */
const { test } = require( 'node:test' );
const assert = require( 'node:assert/strict' );
const { spawnSync } = require( 'node:child_process' );
const fs = require( 'node:fs' );
const os = require( 'node:os' );
const path = require( 'node:path' );

const root = path.join( __dirname, '..' );
const indexPath = path.join( root, 'index.js' );
const cliPath = path.join( root, 'cli.js' );

const pluginHeader = `<?php
/**
 * Plugin Name:        Example Plugin
 * Version:            1.4.0
 */
`;

/**
 * Run a script that calls the updater in a child process.
 *
 * @param {string} body JavaScript that can use `updater`.
 */
function runUpdater( body ) {
	const script = `const updater = require( ${ JSON.stringify(
		indexPath
	) } );\n${ body }`;
	return spawnSync( process.execPath, [ '-e', script ], {
		encoding: 'utf8',
	} );
}

/**
 * Run the CLI in a child process.
 *
 * @param {string[]} args Arguments.
 */
function runCli( args ) {
	return spawnSync( process.execPath, [ cliPath, ...args ], {
		encoding: 'utf8',
	} );
}

/**
 * Write contents to a file in a new temporary directory.
 *
 * @param {string} contents File contents.
 * @return {string} The file path.
 */
function tempFile( contents ) {
	const dir = fs.mkdtempSync( path.join( os.tmpdir(), 'wvu-' ) );
	const file = path.join( dir, 'style.css' );
	fs.writeFileSync( file, contents );
	return file;
}

test( 'readVersion exits with code 1 when there is no Version line', () => {
	const result = runUpdater(
		`updater.readVersion( 'No header here.' ); console.log( 'continued' );`
	);
	assert.equal( result.status, 1 );
	assert.equal( result.stdout, '' );
	assert.match( result.stderr, /No "Version:" line found/ );
} );

test( 'readVersion exits with code 1 when the version has an incorrect format', () => {
	const result = runUpdater(
		`updater.readVersion( '/*\\nVersion: v1.0\\n*/' );`
	);
	assert.equal( result.status, 1 );
	assert.match( result.stderr, /No "Version:" line found/ );
} );

test( 'writeVersion exits with code 1 when there is no Version line', () => {
	const result = runUpdater(
		`updater.writeVersion( 'No header here.', '2.0.0' ); console.log( 'continued' );`
	);
	assert.equal( result.status, 1 );
	assert.equal( result.stdout, '' );
	assert.match( result.stderr, /Could not write version "2\.0\.0"/ );
} );

test( 'writeVersion exits with code 1 when the new version cannot be read back', () => {
	const result = runUpdater(
		`updater.writeVersion( ${ JSON.stringify(
			pluginHeader
		) }, 'not-a-version' );`
	);
	assert.equal( result.status, 1 );
	assert.match( result.stderr, /Could not write version "not-a-version"/ );
} );

test( 'writeVersion exits with code 1 when the version that it reads back is different', () => {
	// The regex stops at a space, so only "2.0.0" is read back.
	const result = runUpdater(
		`updater.writeVersion( ${ JSON.stringify(
			pluginHeader
		) }, '2.0.0 beta' );`
	);
	assert.equal( result.status, 1 );
	assert.match( result.stderr, /has version "2\.0\.0"/ );
} );

test( 'check exits with code 0 and writes nothing when it can read the version', () => {
	const result = runCli( [ 'check', tempFile( pluginHeader ) ] );
	assert.equal( result.status, 0 );
	assert.equal( result.stdout, '' );
	assert.equal( result.stderr, '' );
} );

test( 'check exits with code 1 when there is no Version line', () => {
	const result = runCli( [ 'check', tempFile( '/* Theme Name: X */\n' ) ] );
	assert.equal( result.status, 1 );
	assert.equal( result.stdout, '' );
	assert.match( result.stderr, /No "Version:" line found/ );
} );

test( 'check exits with code 1 when the file does not exist', () => {
	const result = runCli( [ 'check', path.join( root, 'no-such-file.css' ) ] );
	assert.equal( result.status, 1 );
	assert.equal( result.stdout, '' );
	assert.match( result.stderr, /Cannot read/ );
} );

test( 'check exits with code 1 when there is no file argument', () => {
	const result = runCli( [ 'check' ] );
	assert.equal( result.status, 1 );
	assert.equal( result.stdout, '' );
	assert.match( result.stderr, /Usage:/ );
} );

test( 'exits with code 1 for an unknown command', () => {
	const result = runCli( [ 'bump', 'style.css' ] );
	assert.equal( result.status, 1 );
	assert.equal( result.stdout, '' );
	assert.match( result.stderr, /Usage:/ );
} );

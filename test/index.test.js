const { test } = require( 'node:test' );
const assert = require( 'node:assert/strict' );
const { readVersion, writeVersion } = require( '..' );

const pluginHeader = `<?php
/**
 * Plugin Name:        Example Plugin
 * Version:            1.4.0
 * Requires at least:  6.4
 *
 * @package Example
 */
`;

const themeHeader = `/*
Theme Name: Example Theme
Version: 2.3.4
Author: Example
*/
`;

test( 'reads the version from a plugin header', () => {
	assert.equal( readVersion( pluginHeader ), '1.4.0' );
} );

test( 'reads the version from a theme header without a leading *', () => {
	assert.equal( readVersion( themeHeader ), '2.3.4' );
} );

test( 'reads versions with more than one digit in each part', () => {
	const contents = pluginHeader.replace( '1.4.0', '2026.10.22' );
	assert.equal( readVersion( contents ), '2026.10.22' );
} );

test( 'reads and writes versions with up to 4 digits in each part', () => {
	const contents = pluginHeader.replace( '1.4.0', '2026.1022.9999' );
	assert.equal( readVersion( contents ), '2026.1022.9999' );

	const out = writeVersion( contents, '9999.9999.9999' );
	assert.match( out, /^ \* Version: {12}9999\.9999\.9999$/m );
	assert.equal( readVersion( out ), '9999.9999.9999' );
} );

test( 'keeps the padding between the key and the value', () => {
	const out = writeVersion( pluginHeader, '1.10.0' );
	assert.match( out, /^ \* Version: {12}1\.10\.0$/m );
} );

test( 'keeps tabs between the key and the value', () => {
	const out = writeVersion( '/*\n\tVersion:\t1.0.0\n*/\n', '1.0.1' );
	assert.equal( out, '/*\n\tVersion:\t1.0.1\n*/\n' );
} );

test( 'changes only the version line', () => {
	const before = pluginHeader.split( '\n' );
	const after = writeVersion( pluginHeader, '5.6.7' ).split( '\n' );
	const changed = before.filter( ( line, i ) => line !== after[ i ] );
	assert.deepEqual( changed, [ ' * Version:            1.4.0' ] );
} );

test( 'ignores "Version:" in the middle of a line', () => {
	const contents = '// See Version: 9.9.9 in the docs.\n' + pluginHeader;
	assert.equal( readVersion( contents ), '1.4.0' );
} );

test( 'reads back the version that it wrote', () => {
	assert.equal(
		readVersion( writeVersion( themeHeader, '3.0.0' ) ),
		'3.0.0'
	);
} );

test( 'throws a clear error when there is no Version line', () => {
	assert.throws(
		() => readVersion( 'No header here.' ),
		/No "Version:" line found/
	);
} );

test( 'reads pre-release versions', () => {
	for ( const version of [ '1.0.1-0', '1.0.1-alpha.0', '1.4.3-xyz.12' ] ) {
		const contents = pluginHeader.replace( '1.4.0', version );
		assert.equal( readVersion( contents ), version );
	}
} );

test( 'reads versions with build metadata', () => {
	const contents = themeHeader.replace( '2.3.4', '1.1.0-rc.1+build.5' );
	assert.equal( readVersion( contents ), '1.1.0-rc.1+build.5' );
} );

test( 'replaces the whole pre-release suffix when it writes', () => {
	const steps = [ '1.1.0-alpha.0', '1.1.0-alpha.1', '1.1.0-beta.0', '1.1.0' ];
	let contents = pluginHeader;
	for ( const version of steps ) {
		contents = writeVersion( contents, version );
		assert.match(
			contents,
			new RegExp( `^ \\* Version: {12}${ version.replace( /\./g, '\\.' ) }$`, 'm' )
		);
		assert.equal( readVersion( contents ), version );
	}
} );

test( 'replaces the whole value when it is not plain SemVer', () => {
	for ( const version of [ '1.2.3.4', '1.0.0-', '1.0.0-alpha..1' ] ) {
		const contents = pluginHeader.replace( '1.4.0', version );
		assert.equal( readVersion( contents ), version );

		const out = writeVersion( contents, '9.9.9' );
		assert.match( out, /^ \* Version: {12}9\.9\.9$/m );
	}
} );

test( 'stops at the end of a comment on the same line', () => {
	const out = writeVersion( '/*\nVersion: 1.0.0*/\n', '1.0.1' );
	assert.equal( out, '/*\nVersion: 1.0.1*/\n' );
} );

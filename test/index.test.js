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

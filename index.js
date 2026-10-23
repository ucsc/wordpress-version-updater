/**
 * Custom updater for commit-and-tag-version and standard-version.
 *
 * Reads and writes the `Version:` line in a WordPress plugin or theme header.
 * The leading `*` is optional, so theme `style.css` headers also match.
 * Group 1 keeps the key and its padding, so the header stays aligned.
 */
const versionRegex = /^([ \t]*\*?[ \t]*Version:[ \t]*)(\d+\.\d+\.\d+)/m;

/**
 * Read the version from a file header.
 *
 * @param {string} contents File contents.
 * @return {string} The version, for example `1.4.0`.
 */
module.exports.readVersion = function ( contents ) {
	const found = contents.match( versionRegex );
	if ( ! found ) {
		throw new Error( 'No "Version:" line found in the file header.' );
	}
	return found[ 2 ];
};

/**
 * Write a new version into a file header.
 *
 * Only the version number changes. The key and its padding stay the same.
 *
 * @param {string} contents File contents.
 * @param {string} version  The new version.
 * @return {string} The updated file contents.
 */
module.exports.writeVersion = function ( contents, version ) {
	return contents.replace(
		versionRegex,
		( _match, prefix ) => prefix + version
	);
};

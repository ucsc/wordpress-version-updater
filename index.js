/**
 * Custom updater for commit-and-tag-version and standard-version.
 *
 * Reads and writes the `Version:` line in a WordPress plugin or theme header.
 * The leading `*` is optional, so theme `style.css` headers also match.
 * Group 1 keeps the key and its padding, so the header stays aligned.
 * Group 2 takes the whole version, including any pre-release or build suffix
 * such as `1.0.1-0`, `1.1.0-alpha.1` or `1.1.0-rc.1+build.5`. A write then
 * replaces all of it and leaves nothing behind.
 *
 * commit-and-tag-version catches each error that an updater throws, writes it
 * as a warning, and then continues the release. Thus a thrown error lets
 * `package.json` get the new version while the header keeps the old one.
 * To stop the release, this updater writes the error to stderr and exits the
 * process with code 1. This package has one purpose, so this is acceptable.
 */
const versionRegex =
	/^([ \t]*\*?[ \t]*Version:[ \t]*)(\d+\.\d+\.\d+[0-9A-Za-z.+-]*)/m;

/**
 * Find the version in a file header.
 *
 * @param {string} contents File contents.
 * @return {string|null} The version, or null if there is no `Version:` line.
 */
function findVersion( contents ) {
	const found = String( contents ).match( versionRegex );
	return found ? found[ 2 ] : null;
}

/**
 * Write an error to stderr and stop the process with code 1.
 *
 * @param {string} message The error message.
 */
function fail( message ) {
	process.stderr.write( `wordpress-version-updater: ${ message }\n` );
	process.exit( 1 );
}

/**
 * Read the version from a file header.
 *
 * Stops the process with code 1 if the file has no `Version:` line.
 *
 * @param {string} contents File contents.
 * @return {string} The version, for example `1.4.0`.
 */
module.exports.readVersion = function ( contents ) {
	const version = findVersion( contents );
	if ( version === null ) {
		fail( 'No "Version:" line found in the file header.' );
	}
	return version;
};

/**
 * Write a new version into a file header.
 *
 * Only the version number changes. The key and its padding stay the same.
 * Stops the process with code 1 if the new contents do not have the new
 * version.
 *
 * @param {string} contents File contents.
 * @param {string} version  The new version.
 * @return {string} The updated file contents.
 */
module.exports.writeVersion = function ( contents, version ) {
	const updated = String( contents ).replace(
		versionRegex,
		( _match, prefix ) => prefix + version
	);
	const written = findVersion( updated );
	if ( written !== version ) {
		fail(
			written === null
				? `Could not write version "${ version }": no "Version:" line found in the file header.`
				: `Could not write version "${ version }": the file header has version "${ written }".`
		);
	}
	return updated;
};

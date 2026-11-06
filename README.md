# WordPress version updater

A custom updater for [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) and standard-version that reads and writes the version of a WordPress plugin or theme.

## Install

```bash
npm install --save-dev @ucsantacruz/wordpress-version-updater
```

## Use

Add this configuration to `package.json`. For a theme, use `style.css`:

```json
"commit-and-tag-version": {
	"scripts": {
		"prerelease": "wordpress-version-updater check style.css"
	},
	"bumpFiles": [
		{ "filename": "style.css", "updater": "node_modules/@ucsantacruz/wordpress-version-updater/index.js" },
		{ "filename": "package-lock.json", "type": "json" },
		{ "filename": "package.json", "type": "json" }
	]
}
```

For a plugin, use the main plugin PHP file in place of `style.css`:

```json
"commit-and-tag-version": {
	"scripts": {
		"prerelease": "wordpress-version-updater check my-plugin.php"
	},
	"bumpFiles": [
		{ "filename": "my-plugin.php", "updater": "node_modules/@ucsantacruz/wordpress-version-updater/index.js" },
		{ "filename": "package-lock.json", "type": "json" },
		{ "filename": "package.json", "type": "json" }
	]
}
```

commit-and-tag-version loads a string `updater` as a file path, not as a package name. Thus the `updater` value is the path in `node_modules`.

## How the release stops

commit-and-tag-version catches each error that an updater throws. It writes the error as a warning and then continues the release. Thus `package.json` can get the new version while the header keeps the old version. This package prevents that in two ways.

The updater stops the process with exit code 1 in these conditions:

- `readVersion` cannot find a `Version:` line, or the version has an incorrect format.
- `writeVersion` cannot read the new version back from the new contents.

The `check` command runs in the `prerelease` script, before the release writes a file. If the script fails, the release stops. This stops the release in these conditions:

- The package is not installed. The shell cannot find the `wordpress-version-updater` command.
- The `Version:` line is missing. The `check` command exits with code 1.

Because the check occurs before the release writes a file, the order of the items in `bumpFiles` is not important.

Notes:

- Use the `prerelease` script, not `prebump`.
- commit-and-tag-version does not run lifecycle scripts in a dry run (`--dry-run`). In a dry run, a missing package causes only a warning. A real release stops.

## The `check` command

```bash
wordpress-version-updater check <file>
```

The command reads the version from the `Version:` line of the file. It exits with code 0 if it can read the version, and with code 1 if it cannot. It writes nothing to stdout. Errors go to stderr.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).

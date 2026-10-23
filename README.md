# @ucsantacruz/wordpress-version-updater

A custom updater for [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) and standard-version. It reads and writes the `Version:` line in the header of a WordPress plugin or theme.

- Only the version number changes. The padding between `Version:` and the value stays the same, so an aligned header stays aligned.
- The leading `*` is optional. The updater works with plugin headers (` * Version: 1.0.0`) and theme `style.css` headers (`Version: 1.0.0`).
- Each part of the version can have more than one digit, for example `2026.10.22`.
- The updater matches `Version:` only at the start of a line.

## Install

```bash
npm install --save-dev @ucsantacruz/wordpress-version-updater
```

## Use

commit-and-tag-version loads a string `updater` as a file path, not as a package name. Use one of these two configurations.

### Option 1: A path in `package.json`

```json
"commit-and-tag-version": {
	"bumpFiles": [
		{ "filename": "package.json", "type": "json" },
		{ "filename": "package-lock.json", "type": "json" },
		{
			"filename": "my-plugin.php",
			"updater": "node_modules/@ucsantacruz/wordpress-version-updater/index.js"
		}
	]
}
```

### Option 2: A `.versionrc.cjs` file

```js
const wpHeader = require( '@ucsantacruz/wordpress-version-updater' );

module.exports = {
	bumpFiles: [
		{ filename: 'package.json', type: 'json' },
		{ filename: 'package-lock.json', type: 'json' },
		{ filename: 'my-plugin.php', updater: wpHeader },
	],
};
```

For a theme, use `style.css` as the `filename`.

## Develop

```bash
npm test
```

The tests use the built-in Node.js test runner, so they need no dependencies.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).

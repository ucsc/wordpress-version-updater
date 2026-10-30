# WordPress version updater

A custom updater for [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) and standard-version that reads and writes the version of a WordPress plugin or theme.

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

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).

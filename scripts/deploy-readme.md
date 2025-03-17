# WordPress.org SVN Directory Structure

When deploying your plugin to WordPress.org, it's important to understand the SVN directory structure.

## Main Directories

- `/trunk/` - Contains the latest development version of your plugin
- `/tags/` - Contains tagged releases of your plugin (e.g., `/tags/1.0.0/`, `/tags/1.1.0/`)
- `/assets/` - Contains WordPress.org-specific assets (banner, icon, screenshots)

## Inside /trunk/

The `/trunk/` directory should contain your plugin files organized as follows:

- `cookiekit.php` - Main plugin file
- `readme.txt` - WordPress readme file (displayed on your plugin page)
- `uninstall.php` - Cleanup script executed when the plugin is uninstalled
- `/includes/` - Core functionality and class files
- `/admin/` - Admin panel settings and UI-related files
- `/public/` - Frontend-related code (e.g., scripts for the cookie banner)
- `/assets/` - Plugin-specific assets (CSS, JS, images)
- `/languages/` - Translation files (.mo and .po)

## Deployment Process

The plugin deployment process involves:

1. Building your plugin files (`npm run wordpress`)
2. Organizing them into the WordPress.org SVN structure (`npm run deploy:wordpress`)
3. Committing them to the WordPress.org SVN repository

## Creating a Release

To create a new release:

1. Update the version number in:
   - The main plugin file (`cookiekit.php`)
   - `readme.txt`
   - `package.json` (if relevant)
2. Run `npm run deploy:wordpress` to prepare the deployment files
3. Copy the contents to your SVN checkout
4. Create a new tag: `svn copy trunk tags/x.x.x`
5. Commit the changes: `svn commit -m "Release x.x.x"`

The `deploy-wordpress.js` script helps automate steps 1 and 2 by preparing the files for deployment.

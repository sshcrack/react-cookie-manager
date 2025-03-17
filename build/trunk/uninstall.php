<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @link       https://github.com/hypershiphq/react-cookie-manager
 * @since      1.0.0
 *
 * @package    CookieKit
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options created by the plugin
delete_option('cookiekit_settings');
delete_option('cookiekit_version');

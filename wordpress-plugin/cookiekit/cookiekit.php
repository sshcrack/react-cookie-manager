<?php
/**
 * Plugin Name: CookieKit GDPR & Cookie Consent
 * Plugin URI: https://github.com/hypershiphq/react-cookie-manager
 * Description: 🍪 Professional GDPR & CCPA compliant cookie consent solution. Beautiful design, automatic script blocking, and complete cookie compliance for WordPress.
 * Version: 1.0.0
 * Author: Hypership
 * Author URI: https://github.com/hypershiphq
 * License: MIT
 * Text Domain: cookiekit
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

define('COOKIEKIT_VERSION', '1.0.0');
define('COOKIEKIT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('COOKIEKIT_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Enqueue scripts and styles.
 */
function cookiekit_enqueue_scripts() {
    // Load our plugin's JS first
    wp_enqueue_script(
        'cookiekit-main',
        COOKIEKIT_PLUGIN_URL . 'assets/cookie-manager.b255e5eb.js',
        array(),
        null, // Version will be part of the filename
        false // Load in header
    );

    // Then enqueue our plugin's CSS
    wp_enqueue_style(
        'cookiekit-styles',
        COOKIEKIT_PLUGIN_URL . 'assets/cookie-manager.b255e5eb.css',
        array(),
        null // Version will be part of the filename
    );
}
add_action('wp_enqueue_scripts', 'cookiekit_enqueue_scripts');

/**
 * Add admin menu
 */
function cookiekit_admin_menu() {
    add_options_page(
        'CookieKit Settings',
        'CookieKit',
        'manage_options',
        'cookiekit-settings',
        'cookiekit_settings_page'
    );
}
add_action('admin_menu', 'cookiekit_admin_menu');

/**
 * Register settings
 */
function cookiekit_register_settings() {
    register_setting('cookiekit_options', 'cookiekit_settings', array(
        'type' => 'object',
        'default' => array(
            'cookie_expiration' => 365,
            'cookie_name' => 'cookiekit_consent',
            'enable_analytics' => true,
            'enable_marketing' => true,
            'enable_preferences' => true,
            'style' => 'banner',
            'primary_color' => '#007bff',
            'text_color' => '#ffffff',
            'version_hash' => 'v1_' . substr(md5(COOKIEKIT_VERSION . time()), 0, 8)
        ),
        'sanitize_callback' => 'cookiekit_sanitize_settings'
    ));
}
add_action('admin_init', 'cookiekit_register_settings');

/**
 * Sanitize settings and preserve version hash
 */
function cookiekit_sanitize_settings($settings) {
    $old_settings = get_option('cookiekit_settings');
    if (isset($old_settings['version_hash'])) {
        $settings['version_hash'] = $old_settings['version_hash'];
    } else {
        $settings['version_hash'] = 'v1_' . substr(md5(COOKIEKIT_VERSION . time()), 0, 8);
    }
    return $settings;
}

/**
 * Settings page HTML
 */
function cookiekit_settings_page() {
    // Get saved settings
    $settings = get_option('cookiekit_settings');

    // Ensure version_hash exists
    if (!isset($settings['version_hash'])) {
        $settings['version_hash'] = 'v1_' . substr(md5(COOKIEKIT_VERSION . time()), 0, 8);
        update_option('cookiekit_settings', $settings);
    }
    ?>
    <div class="wrap">
        <h1>CookieKit Settings</h1>
        <p class="description">Version Hash: <?php echo esc_html($settings['version_hash']); ?></p>
        <form method="post" action="options.php">
            <?php
            settings_fields('cookiekit_options');
            do_settings_sections('cookiekit_options');
            ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Cookie Expiration (days)</th>
                    <td>
                        <input type="number" name="cookiekit_settings[cookie_expiration]" 
                               value="<?php echo esc_attr($settings['cookie_expiration']); ?>" min="1" max="365">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Cookie Name</th>
                    <td>
                        <input type="text" name="cookiekit_settings[cookie_name]" 
                               value="<?php echo esc_attr($settings['cookie_name']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Enable Categories</th>
                    <td>
                        <label>
                            <input type="checkbox" name="cookiekit_settings[enable_analytics]" 
                                   <?php checked($settings['enable_analytics'], true); ?>>
                            Analytics
                        </label><br>
                        <label>
                            <input type="checkbox" name="cookiekit_settings[enable_marketing]" 
                                   <?php checked($settings['enable_marketing'], true); ?>>
                            Marketing
                        </label><br>
                        <label>
                            <input type="checkbox" name="cookiekit_settings[enable_preferences]" 
                                   <?php checked($settings['enable_preferences'], true); ?>>
                            Preferences
                        </label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Consent Style</th>
                    <td>
                        <select name="cookiekit_settings[style]">
                            <option value="banner" <?php selected($settings['style'], 'banner'); ?>>Banner</option>
                            <option value="popup" <?php selected($settings['style'], 'popup'); ?>>Popup</option>
                            <option value="modal" <?php selected($settings['style'], 'modal'); ?>>Modal</option>
                        </select>
                        <p class="description">
                            Banner - Full-width banner at the bottom<br>
                            Popup - Compact popup in the bottom-left corner<br>
                            Modal - Centered modal with overlay
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Primary Color</th>
                    <td>
                        <input type="color" name="cookiekit_settings[primary_color]" 
                               value="<?php echo esc_attr($settings['primary_color']); ?>">
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/**
 * Initialize the cookie manager
 */
function cookiekit_init() {
    $settings = get_option('cookiekit_settings');
    ?>
    <script>
        // Initialize CookieKit with settings
        window.addEventListener('load', function() {
            if (typeof window.CookieKit === 'undefined') {
                console.error('CookieKit not loaded');
                return;
            }

            window.CookieKit.init({
                cookieName: '<?php echo esc_js($settings['cookie_name']); ?>',
                cookieExpiration: <?php echo intval($settings['cookie_expiration']); ?>,
                privacyPolicy: '<?php echo esc_js(get_privacy_policy_url()); ?>',
                style: '<?php echo esc_js($settings['style']); ?>',
                theme: 'light',
                categories: {
                    analytics: <?php echo $settings['enable_analytics'] ? 'true' : 'false'; ?>,
                    marketing: <?php echo $settings['enable_marketing'] ? 'true' : 'false'; ?>,
                    preferences: <?php echo $settings['enable_preferences'] ? 'true' : 'false'; ?>
                }
            });
        });
    </script>

    <?php if ($settings['enable_analytics']): ?>
    <script data-cookiekit="analytics" type="text/plain">
        // Google Analytics code would go here
        console.log('Analytics enabled');
    </script>
    <?php endif; ?>

    <?php if ($settings['enable_marketing']): ?>
    <script data-cookiekit="marketing" type="text/plain">
        // Marketing pixels would go here
        console.log('Marketing enabled');
    </script>
    <?php endif; ?>
    <?php
}
add_action('wp_footer', 'cookiekit_init');

/**
 * Activation hook
 */
function cookiekit_activate() {
    // Add default settings if they don't exist
    if (!get_option('cookiekit_settings')) {
        add_option('cookiekit_settings', array(
            'cookie_expiration' => 365,
            'cookie_name' => 'cookiekit_consent',
            'enable_analytics' => true,
            'enable_marketing' => true,
            'enable_preferences' => true,
            'style' => 'banner',
            'primary_color' => '#007bff',
            'version_hash' => 'v1_' . substr(md5(COOKIEKIT_VERSION . time()), 0, 8)
        ));
    }
}
register_activation_hook(__FILE__, 'cookiekit_activate');

/**
 * Deactivation hook
 */
function cookiekit_deactivate() {
    // Cleanup if needed
}
register_deactivation_hook(__FILE__, 'cookiekit_deactivate'); 
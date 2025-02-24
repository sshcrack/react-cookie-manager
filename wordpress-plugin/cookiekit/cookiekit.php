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
        COOKIEKIT_PLUGIN_URL . 'assets/cookie-manager.733d8e39.js',
        array(),
        null, // Version will be part of the filename
        false // Load in header
    );

    // Then enqueue our plugin's CSS
    wp_enqueue_style(
        'cookiekit-styles',
        COOKIEKIT_PLUGIN_URL . 'assets/cookie-manager.733d8e39.css',
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
            'style' => 'banner',
            'theme' => 'light',
            'cookiekit_id' => '',
            'version_hash' => 'v1_' . substr(md5(COOKIEKIT_VERSION . time()), 0, 8),
            'text_settings' => array(
                'title' => 'Would You Like A Cookie? 🍪',
                'message' => 'We use cookies to enhance your browsing experience and analyze our traffic.',
                'accept_button' => 'Accept All',
                'decline_button' => 'Decline All',
                'customize_button' => 'Customize',
                'privacy_policy_text' => 'Privacy Policy',
                'modal_title' => 'Cookie Preferences',
                'modal_message' => 'Choose which cookies you want to accept.',
                'save_preferences' => 'Save Preferences',
                'cancel' => 'Cancel'
            )
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
    
    // Preserve version hash
    if (isset($old_settings['version_hash'])) {
        $settings['version_hash'] = $old_settings['version_hash'];
    } else {
        $settings['version_hash'] = 'v1_' . substr(md5(COOKIEKIT_VERSION . time()), 0, 8);
    }

    // Ensure text settings exist with defaults
    if (!isset($settings['text_settings'])) {
        $settings['text_settings'] = array(
            'title' => 'Would You Like A Cookie? 🍪',
            'message' => 'We use cookies to enhance your browsing experience and analyze our traffic.',
            'accept_button' => 'Accept All',
            'decline_button' => 'Decline All',
            'customize_button' => 'Customize',
            'privacy_policy_text' => 'Privacy Policy',
            'modal_title' => 'Cookie Preferences',
            'modal_message' => 'Choose which cookies you want to accept.',
            'save_preferences' => 'Save Preferences',
            'cancel' => 'Cancel'
        );
    }

    // Sanitize all text inputs
    foreach ($settings['text_settings'] as $key => $value) {
        $settings['text_settings'][$key] = sanitize_text_field($value);
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

    // Ensure text settings exist with defaults
    if (!isset($settings['text_settings'])) {
        $settings['text_settings'] = array(
            'title' => 'Would You Like A Cookie? 🍪',
            'message' => 'We use cookies to enhance your browsing experience and analyze our traffic.',
            'accept_button' => 'Accept All',
            'decline_button' => 'Decline All',
            'customize_button' => 'Customize',
            'privacy_policy_text' => 'Privacy Policy',
            'modal_title' => 'Cookie Preferences',
            'modal_message' => 'Choose which cookies you want to accept.',
            'save_preferences' => 'Save Preferences',
            'cancel' => 'Cancel'
        );
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
            
            <h2 class="title">General Settings</h2>
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
                        <p class="description">The key name used to store cookie preferences in the browser's storage (e.g. "cookiekit_consent")</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">CookieKit ID</th>
                    <td>
                        <input type="text" name="cookiekit_settings[cookiekit_id]" 
                               value="<?php echo esc_attr($settings['cookiekit_id']); ?>"
                               placeholder="Enter your CookieKit ID">
                        <p class="description">Your unique project identifier from <a href="https://cookiekit.io" target="_blank">CookieKit</a></p>
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
                    <th scope="row">Theme</th>
                    <td>
                        <select name="cookiekit_settings[theme]">
                            <option value="light" <?php selected($settings['theme'], 'light'); ?>>Light</option>
                            <option value="dark" <?php selected($settings['theme'], 'dark'); ?>>Dark</option>
                        </select>
                        <p class="description">Choose between light and dark theme for the consent UI</p>
                    </td>
                </tr>
            </table>

            <h2 class="title" style="margin-top: 2em;">UI Text Customization</h2>
            <p class="description">Customize the text displayed in the cookie consent interface</p>
            <table class="form-table">
                <tr>
                    <th scope="row">Banner Title</th>
                    <td>
                        <input type="text" class="regular-text" 
                               name="cookiekit_settings[text_settings][title]" 
                               value="<?php echo esc_attr($settings['text_settings']['title']); ?>">
                        <p class="description">The main title shown in the consent banner</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Banner Message</th>
                    <td>
                        <textarea class="large-text" rows="2" 
                                 name="cookiekit_settings[text_settings][message]"><?php 
                            echo esc_textarea($settings['text_settings']['message']); 
                        ?></textarea>
                        <p class="description">The main message explaining cookie usage</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Accept Button</th>
                    <td>
                        <input type="text" 
                               name="cookiekit_settings[text_settings][accept_button]" 
                               value="<?php echo esc_attr($settings['text_settings']['accept_button']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Decline Button</th>
                    <td>
                        <input type="text" 
                               name="cookiekit_settings[text_settings][decline_button]" 
                               value="<?php echo esc_attr($settings['text_settings']['decline_button']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Customize Button</th>
                    <td>
                        <input type="text" 
                               name="cookiekit_settings[text_settings][customize_button]" 
                               value="<?php echo esc_attr($settings['text_settings']['customize_button']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Privacy Policy Link Text</th>
                    <td>
                        <input type="text" 
                               name="cookiekit_settings[text_settings][privacy_policy_text]" 
                               value="<?php echo esc_attr($settings['text_settings']['privacy_policy_text']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Preferences Modal Title</th>
                    <td>
                        <input type="text" class="regular-text"
                               name="cookiekit_settings[text_settings][modal_title]" 
                               value="<?php echo esc_attr($settings['text_settings']['modal_title']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Preferences Modal Message</th>
                    <td>
                        <textarea class="large-text" rows="2" 
                                 name="cookiekit_settings[text_settings][modal_message]"><?php 
                            echo esc_textarea($settings['text_settings']['modal_message']); 
                        ?></textarea>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Save Preferences Button</th>
                    <td>
                        <input type="text" 
                               name="cookiekit_settings[text_settings][save_preferences]" 
                               value="<?php echo esc_attr($settings['text_settings']['save_preferences']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Cancel Button</th>
                    <td>
                        <input type="text" 
                               name="cookiekit_settings[text_settings][cancel]" 
                               value="<?php echo esc_attr($settings['text_settings']['cancel']); ?>">
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
    
    // Default text settings
    $default_text = array(
        'title' => 'Would You Like A Cookie? 🍪',
        'message' => 'We use cookies to enhance your browsing experience and analyze our traffic.',
        'accept_button' => 'Accept All',
        'decline_button' => 'Decline All',
        'customize_button' => 'Customize',
        'privacy_policy_text' => 'Privacy Policy',
        'modal_title' => 'Cookie Preferences',
        'modal_message' => 'Choose which cookies you want to accept.',
        'save_preferences' => 'Save Preferences',
        'cancel' => 'Cancel'
    );

    // Merge settings with defaults
    $text_settings = isset($settings['text_settings']) ? 
        array_merge($default_text, $settings['text_settings']) : 
        $default_text;

    // Default general settings
    $default_settings = array(
        'cookie_expiration' => 365,
        'cookie_name' => 'cookiekit_consent',
        'style' => 'banner',
        'theme' => 'light',
        'cookiekit_id' => ''
    );

    // Merge general settings with defaults
    $settings = array_merge($default_settings, $settings);
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
                theme: '<?php echo esc_js($settings['theme']); ?>',
                cookieKitId: '<?php echo esc_js($settings['cookiekit_id']); ?>',
                translations: {
                    title: '<?php echo esc_js($text_settings['title']); ?>',
                    message: '<?php echo esc_js($text_settings['message']); ?>',
                    buttonText: '<?php echo esc_js($text_settings['accept_button']); ?>',
                    declineButtonText: '<?php echo esc_js($text_settings['decline_button']); ?>',
                    manageButtonText: '<?php echo esc_js($text_settings['customize_button']); ?>',
                    privacyPolicyText: '<?php echo esc_js($text_settings['privacy_policy_text']); ?>',
                    manageTitle: '<?php echo esc_js($text_settings['modal_title']); ?>',
                    manageMessage: '<?php echo esc_js($text_settings['modal_message']); ?>',
                    savePreferences: '<?php echo esc_js($text_settings['save_preferences']); ?>',
                    cancel: '<?php echo esc_js($text_settings['cancel']); ?>'
                }
            });
        });
    </script>
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
            'style' => 'banner',
            'theme' => 'light',
            'cookiekit_id' => '',
            'version_hash' => 'v1_' . substr(md5(COOKIEKIT_VERSION . time()), 0, 8),
            'text_settings' => array(
                'title' => 'Would You Like A Cookie? 🍪',
                'message' => 'We use cookies to enhance your browsing experience and analyze our traffic.',
                'accept_button' => 'Accept All',
                'decline_button' => 'Decline All',
                'customize_button' => 'Customize',
                'privacy_policy_text' => 'Privacy Policy',
                'modal_title' => 'Cookie Preferences',
                'modal_message' => 'Choose which cookies you want to accept.',
                'save_preferences' => 'Save Preferences',
                'cancel' => 'Cancel'
            )
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
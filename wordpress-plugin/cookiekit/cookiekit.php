<?php
/**
 * Plugin Name: CookieKit GDPR & Cookie Consent
 * Plugin URI: https://github.com/hypershiphq/react-cookie-manager
 * Description: 🍪 Professional GDPR & CCPA compliant cookie consent solution. Beautiful design, automatic script blocking, and complete cookie compliance for WordPress.
 * Version: 1.0.0
 * Author: Hypership
 * Author URI: https://github.com/hypershiphq
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: cookiekit-gdpr-cookie-consent
 *
 * CookieKit is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * CookieKit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CookieKit. If not, see http://www.gnu.org/licenses/gpl-2.0.txt.
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

define('COOKIEKIT_VERSION', '1.0.0');
define('COOKIEKIT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('COOKIEKIT_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Add settings link to plugin page
 */
function cookiekit_add_settings_link($links) {
    $settings_link = '<a href="' . admin_url('options-general.php?page=cookiekit-settings') . '">' . __('Settings', 'cookiekit-gdpr-cookie-consent') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'cookiekit_add_settings_link');

/**
 * Enqueue scripts and styles.
 */
function cookiekit_enqueue_scripts() {
    // Load our plugin's JS first
    wp_enqueue_script(
        'cookiekit-main',
        COOKIEKIT_PLUGIN_URL . 'assets/cookie-manager.28dcff63.js',
        array(),
        null, // Version will be part of the filename
        false // Load in header
    );

    // Then enqueue our plugin's CSS
    wp_enqueue_style(
        'cookiekit-styles',
        COOKIEKIT_PLUGIN_URL . 'assets/cookie-manager.28dcff63.css',
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
            'allowed_domains' => '',
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
    
    // Register option for dismissing the import/export notice
    register_setting('cookiekit_options', 'cookiekit_import_export_notice_dismissed', array(
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => 'rest_sanitize_boolean'
    ));
}
add_action('admin_init', 'cookiekit_register_settings');

/**
 * Display admin notice about import/export functionality
 */
function cookiekit_admin_notices() {
    // Only show on our settings page
    $screen = get_current_screen();
    if ($screen->id !== 'settings_page_cookiekit-settings') {
        return;
    }
    
    // Check if notice has been dismissed
    $notice_dismissed = get_option('cookiekit_import_export_notice_dismissed', false);
    if ($notice_dismissed) {
        return;
    }
    
    ?>
    <div class="notice notice-info is-dismissible cookiekit-import-export-notice">
        <p>
            <strong><?php _e('New Feature: Import/Export Settings', 'cookiekit-gdpr-cookie-consent'); ?></strong>
        </p>
        <p>
            <?php _e('You can now quickly configure CookieKit by importing settings from a JSON file or export your current settings for backup or use on another site.', 'cookiekit-gdpr-cookie-consent'); ?>
            <?php _e('Look for the Import/Export section below!', 'cookiekit-gdpr-cookie-consent'); ?>
        </p>
    </div>
    <script>
        jQuery(document).ready(function($) {
            $(document).on('click', '.cookiekit-import-export-notice .notice-dismiss', function() {
                $.ajax({
                    url: ajaxurl,
                    data: {
                        action: 'cookiekit_dismiss_import_export_notice'
                    }
                });
            });
        });
    </script>
    <?php
}
add_action('admin_notices', 'cookiekit_admin_notices');

/**
 * AJAX handler to dismiss the import/export notice
 */
function cookiekit_dismiss_import_export_notice() {
    update_option('cookiekit_import_export_notice_dismissed', true);
    wp_die();
}
add_action('wp_ajax_cookiekit_dismiss_import_export_notice', 'cookiekit_dismiss_import_export_notice');

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

    // Handle settings import
    if (isset($_FILES['cookiekit_import_file']) && !empty($_FILES['cookiekit_import_file']['tmp_name'])) {
        $import_file = $_FILES['cookiekit_import_file']['tmp_name'];
        $import_data = file_get_contents($import_file);
        
        if ($import_data) {
            $imported_settings = json_decode($import_data, true);
            
            if (json_last_error() === JSON_ERROR_NONE && is_array($imported_settings)) {
                // Preserve version hash
                if (isset($settings['version_hash'])) {
                    $imported_settings['version_hash'] = $settings['version_hash'];
                }
                
                // Update settings
                update_option('cookiekit_settings', $imported_settings);
                
                // Refresh settings
                $settings = $imported_settings;
                
                // Show success message
                add_settings_error(
                    'cookiekit_settings',
                    'settings_updated',
                    __('Settings imported successfully.', 'cookiekit-gdpr-cookie-consent'),
                    'updated'
                );
            } else {
                // Show error message
                add_settings_error(
                    'cookiekit_settings',
                    'import_error',
                    __('Invalid settings file. Please upload a valid JSON file.', 'cookiekit-gdpr-cookie-consent'),
                    'error'
                );
            }
        }
    }
    
    // Handle settings export
    if (isset($_POST['cookiekit_export_settings'])) {
        // Instead of using headers directly, we'll use a JavaScript approach
        $export_data = json_encode($settings, JSON_PRETTY_PRINT);
        $filename = 'cookiekit-settings.json';
        
        // Store the export data in a transient
        set_transient('cookiekit_export_data', $export_data, 60 * 5); // 5 minutes expiration
        
        // Set a flag to trigger the JavaScript download
        $should_trigger_download = true;
    }
    
    // Handle sample settings download
    if (isset($_POST['cookiekit_download_sample'])) {
        $sample_settings = array(
            'cookie_expiration' => 365,
            'cookie_name' => 'cookiekit_consent',
            'style' => 'banner',
            'theme' => 'light',
            'cookiekit_id' => 'YOUR_COOKIEKIT_ID_HERE',
            'allowed_domains' => "example.com\napi.example.com",
            'text_settings' => array(
                'title' => 'Cookie Consent',
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
        );
        
        $sample_data = json_encode($sample_settings, JSON_PRETTY_PRINT);
        $filename = 'cookiekit-sample-settings.json';
        
        // Store the sample data in a transient
        set_transient('cookiekit_export_data', $sample_data, 60 * 5); // 5 minutes expiration
        
        // Set a flag to trigger the JavaScript download
        $should_trigger_download = true;
    }
    ?>
    <div class="wrap">
        <!-- CookieKit Logo and Header -->
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="margin-right: 15px;">
                <img src="<?php echo COOKIEKIT_PLUGIN_URL; ?>assets/cookiekit-logo.png" alt="CookieKit Logo" style="width: 60px; height: auto;" onerror="this.src='<?php echo COOKIEKIT_PLUGIN_URL; ?>assets/cookiekit-logo.png'; this.onerror=null;">
            </div>
            <div>
                <h1 style="margin: 0;">CookieKit: GDPR & Cookie Consent</h1>
                <p class="description">Version: <?php echo COOKIEKIT_VERSION; ?> | Hash: <?php echo esc_html($settings['version_hash']); ?></p>
            </div>
        </div>
        
        <!-- GDPR Compliance Section -->
        <div class="card" style="max-width: 100%; margin-bottom: 30px; padding: 25px; background-color: #f8fcff; border: 1px solid #2271b1; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.05);">
            <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
                <div style="flex: 1; min-width: 300px;">
                    <h2 style="margin-top: 0; color: #2271b1; font-size: 1.5em;">🔒 100% GDPR & CCPA Compliance</h2>
                    <p style="font-size: 15px; margin-bottom: 15px;">Take your cookie consent to the next level with CookieKit's compliance features:</p>
                    <ul style="font-size: 14px;">
                        <li><strong>Consent Logging:</strong> Automatically log all user consent actions</li>
                        <li><strong>Proof of Consent:</strong> Maintain records for regulatory requirements</li>
                        <li><strong>Analytics Dashboard:</strong> Monitor consent rates and user behavior</li>
                    </ul>
                    <div style="margin-top: 15px;">
                        <a href="https://cookiekit.io/?utm_source=wp-plugin&utm_medium=settings-page" target="_blank" class="button button-primary" style="padding: 8px 20px; font-weight: 600; font-size: 14px;">Sign Up Free - No Credit Card Required</a>
                        <p class="description" style="margin-top: 8px;">✓ 2,000 monthly consent logs included in free plan</p>
                    </div>
                </div>
            </div>
        </div>
        
        <form method="post" action="options.php">
            <?php
            settings_fields('cookiekit_options');
            do_settings_sections('cookiekit_options');
            ?>
            
            <h2 class="title">General Settings</h2>
            <table class="form-table">
                <tr>
                    <th scope="row">CookieKit ID</th>
                    <td>
                        <div style="background: #f0f6ff; border: 1px solid #2271b1; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <input type="text" 
                                   name="cookiekit_settings[cookiekit_id]" 
                                   value="<?php echo esc_attr($settings['cookiekit_id']); ?>"
                                   placeholder="Enter your CookieKit ID"
                                   style="width: 100%; padding: 8px; margin-bottom: 10px;">
                            <p class="description" style="margin-bottom: 10px;">
                                <strong>💡 Get 2,000 GDPR-compliant consent logs free every month</strong>
                            </p>
                            <p class="description" style="margin-bottom: 0;">
                                1. Sign up for a free account at <a href="https://cookiekit.io" target="_blank">CookieKit.io</a><br>
                                2. Create a new project<br>
                                3. Copy your project ID and paste it above
                                4. Become 100% GDPR compliant
                            </p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Cookie Expiration (days)</th>
                    <td>
                        <input type="number" name="cookiekit_settings[cookie_expiration]" 
                               value="<?php echo esc_attr($settings['cookie_expiration']); ?>" min="1" max="365">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Allowed Trackers</th>
                    <td>
                        <textarea class="large-text" rows="4" 
                                 name="cookiekit_settings[allowed_domains]"
                                 placeholder="example.com&#10;api.example.com&#10;cdn.example.com"><?php 
                            echo isset($settings['allowed_domains']) ? esc_textarea($settings['allowed_domains']) : ''; 
                        ?></textarea>
                        <p class="description">Enter one domain per line. These domains will not be blocked, even if consent is not given. Do not include http:// or https://</p>
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
        
        <!-- Import/Export Section (Moved to bottom) -->
        <div class="card" style="max-width: 100%; margin-top: 30px; margin-bottom: 20px; padding: 20px; background-color: #fff; border: 1px solid #c3c4c7; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,.04);">
            <h2 style="margin-top: 0;"><?php _e('Import/Export Settings', 'cookiekit-gdpr-cookie-consent'); ?></h2>
            <p><?php _e('Quickly configure your plugin by importing settings from a JSON file or export your current settings for backup or use on another site.', 'cookiekit-gdpr-cookie-consent'); ?></p>
            
            <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                <!-- Import Settings -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-top: 0;"><?php _e('Import Settings', 'cookiekit-gdpr-cookie-consent'); ?></h3>
                    <p><?php _e('Upload a JSON file to import settings. This will overwrite your current settings.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    <ol style="margin-left: 1.5em;">
                        <li><?php _e('Create a JSON file with your settings', 'cookiekit-gdpr-cookie-consent'); ?></li>
                        <li><?php _e('Click "Choose File" and select your JSON file', 'cookiekit-gdpr-cookie-consent'); ?></li>
                        <li><?php _e('Click "Import Settings" to apply the settings', 'cookiekit-gdpr-cookie-consent'); ?></li>
                    </ol>
                    <form method="post" enctype="multipart/form-data">
                        <input type="file" name="cookiekit_import_file" accept=".json" style="margin-bottom: 10px; display: block;">
                        <?php submit_button(__('Import Settings', 'cookiekit-gdpr-cookie-consent'), 'secondary', 'cookiekit_import_settings', false); ?>
                    </form>
                </div>
                
                <!-- Export Settings -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-top: 0;"><?php _e('Export Settings', 'cookiekit-gdpr-cookie-consent'); ?></h3>
                    <p><?php _e('Download your current settings as a JSON file for backup or use on another site.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    <form method="post" style="margin-bottom: 15px;">
                        <?php submit_button(__('Export Current Settings', 'cookiekit-gdpr-cookie-consent'), 'primary', 'cookiekit_export_settings', false, array(
                            'title' => __('Keyboard shortcut: Alt+E', 'cookiekit-gdpr-cookie-consent'),
                            'accesskey' => 'e',
                            'style' => 'position: relative;'
                        )); ?>
                        <p class="description"><?php _e('Tip: Use Alt+E (Windows) or Option+E (Mac) to quickly export settings.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    </form>
                    
                    <h4><?php _e('Need a template?', 'cookiekit-gdpr-cookie-consent'); ?></h4>
                    <p><?php _e('Download a sample settings file to use as a template for creating your own settings file.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    <form method="post">
                        <?php submit_button(__('Download Sample Template', 'cookiekit-gdpr-cookie-consent'), 'secondary', 'cookiekit_download_sample', false); ?>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        // Add visual indicator for export button
        $('input[name="cookiekit_export_settings"]').css({
            'animation': 'pulse 2s infinite'
        });
        
        // Add CSS for pulse animation
        $('<style>')
            .prop('type', 'text/css')
            .html(`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(30, 140, 190, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(30, 140, 190, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(30, 140, 190, 0); }
                }
            `)
            .appendTo('head');
            
        <?php if (isset($should_trigger_download) && $should_trigger_download): ?>
        // Trigger download via AJAX
        $.ajax({
            url: ajaxurl,
            data: {
                action: 'cookiekit_download_settings',
                _wpnonce: '<?php echo wp_create_nonce('cookiekit_download_settings'); ?>'
            },
            success: function(response) {
                if (response.success) {
                    // Create an invisible link and trigger download
                    var a = document.createElement('a');
                    var blob = new Blob([response.data.content], {type: 'application/json'});
                    var url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = response.data.filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                } else {
                    alert('<?php _e('Error downloading settings file.', 'cookiekit-gdpr-cookie-consent'); ?>');
                }
            },
            error: function() {
                alert('<?php _e('Error downloading settings file.', 'cookiekit-gdpr-cookie-consent'); ?>');
            }
        });
        <?php endif; ?>
    });
    </script>
    <?php
}

/**
 * AJAX handler for downloading settings
 */
function cookiekit_download_settings_ajax() {
    // Verify nonce
    check_ajax_referer('cookiekit_download_settings');
    
    // Check if user has permission
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => __('You do not have permission to download settings.', 'cookiekit-gdpr-cookie-consent')));
        return;
    }
    
    // Get the export data from transient
    $export_data = get_transient('cookiekit_export_data');
    
    if ($export_data) {
        // Determine filename based on the type of export
        $sample_settings = json_decode($export_data, true);
        $filename = isset($sample_settings['cookiekit_id']) && $sample_settings['cookiekit_id'] === 'YOUR_COOKIEKIT_ID_HERE' 
            ? 'cookiekit-sample-settings.json' 
            : 'cookiekit-settings.json';
        
        // Delete the transient
        delete_transient('cookiekit_export_data');
        
        // Send the data
        wp_send_json_success(array(
            'content' => $export_data,
            'filename' => $filename
        ));
    } else {
        wp_send_json_error(array('message' => __('Export data not found or expired.', 'cookiekit-gdpr-cookie-consent')));
    }
}
add_action('wp_ajax_cookiekit_download_settings', 'cookiekit_download_settings_ajax');

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
                allowedDomains: <?php 
                    $allowed = isset($settings['allowed_domains']) && !empty($settings['allowed_domains']) 
                        ? array_filter(array_map('trim', explode("\n", $settings['allowed_domains'])))
                        : array();
                    echo json_encode($allowed);
                ?>,
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
            'allowed_domains' => '',
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
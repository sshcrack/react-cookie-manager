<?php
/**
 * Plugin Name: CookieKit GDPR & Cookie Consent
 * Plugin URI: https://github.com/hypershiphq/react-cookie-manager
 * Description: 🍪 Professional GDPR & CCPA compliant cookie consent solution. Beautiful design, automatic script blocking, and complete cookie compliance for WordPress.
 * Version: 1.1.0
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

define('COOKIEKIT_VERSION', '1.1.0');
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
 * Get the current cookie manager asset filename with hash
 * 
 * @param string $extension File extension (js or css)
 * @return string Complete filename with hash
 */
function cookiekit_get_asset_filename($extension = 'js') {
    $directory = $extension === 'js' ? 'js' : 'css';
    $pattern = COOKIEKIT_PLUGIN_DIR . 'assets/' . $directory . '/cookie-manager.*.' . $extension;
    $files = glob($pattern);
    
    if (!empty($files)) {
        // Return just the filename, not the full path
        return basename($files[0]);
    }
    
    // Fallback to the version we know about
    return 'cookie-manager.ab0913e3.' . $extension;
}

/**
 * Enqueue scripts and styles.
 */
function cookiekit_enqueue_scripts() {
    // Get the current JS and CSS filenames with hash
    $js_file = cookiekit_get_asset_filename('js');
    $css_file = cookiekit_get_asset_filename('css');
    
    // Register and enqueue the actual cookie manager script
    wp_register_script(
        'cookiekit-js',
        COOKIEKIT_PLUGIN_URL . 'assets/js/' . $js_file,
        array(),
        COOKIEKIT_VERSION,
        array(
            'in_footer' => true,
            'strategy' => 'defer',
        )
    );
    wp_enqueue_script('cookiekit-js');
    
    // Register and enqueue the compiled CSS
    wp_register_style(
        'cookiekit-css',
        COOKIEKIT_PLUGIN_URL . 'assets/css/' . $css_file,
        array(),
        COOKIEKIT_VERSION
    );
    wp_enqueue_style('cookiekit-css');
    
    // Get saved settings
    $settings = get_option('cookiekit_settings', array());
    $text_settings = isset($settings['text_settings']) ? $settings['text_settings'] : array();
    
    $cookiekit_data = array(
        'cookieName' => isset($settings['cookie_name']) ? $settings['cookie_name'] : 'cookiekit_consent',
        'cookieExpiration' => isset($settings['cookie_expiration']) ? intval($settings['cookie_expiration']) : 365,
        'privacyPolicy' => get_privacy_policy_url(),
        'style' => isset($settings['style']) ? $settings['style'] : 'banner',
        'theme' => isset($settings['theme']) ? $settings['theme'] : 'light',
        'main_color' => isset($settings['main_color']) ? $settings['main_color'] : '#3b82f6',
        'cookieKitId' => isset($settings['cookiekit_id']) ? $settings['cookiekit_id'] : '',
        'allowedDomains' => isset($settings['allowed_domains']) && !empty($settings['allowed_domains']) 
            ? array_filter(array_map('trim', explode("\n", $settings['allowed_domains'])))
            : array(),
        'translations' => array(
            'title' => isset($text_settings['title']) ? $text_settings['title'] : 'Would You Like A Cookie? 🍪',
            'message' => isset($text_settings['message']) ? $text_settings['message'] : 'We use cookies to enhance your browsing experience and analyze our traffic.',
            'buttonText' => isset($text_settings['accept_button']) ? $text_settings['accept_button'] : 'Accept All',
            'declineButtonText' => isset($text_settings['decline_button']) ? $text_settings['decline_button'] : 'Decline All',
            'manageButtonText' => isset($text_settings['customize_button']) ? $text_settings['customize_button'] : 'Customize',
            'privacyPolicyText' => isset($text_settings['privacy_policy_text']) ? $text_settings['privacy_policy_text'] : 'Privacy Policy',
            'manageTitle' => isset($text_settings['modal_title']) ? $text_settings['modal_title'] : 'Cookie Preferences',
            'manageMessage' => isset($text_settings['modal_message']) ? $text_settings['modal_message'] : 'Choose which cookies you want to accept.',
            'manageSaveButtonText' => isset($text_settings['save_preferences']) ? $text_settings['save_preferences'] : 'Save Preferences',
            'manageCancelButtonText' => isset($text_settings['cancel']) ? $text_settings['cancel'] : 'Cancel',
            'modalTitle' => isset($text_settings['modal_title']) ? $text_settings['modal_title'] : 'Cookie Preferences',
            'modalMessage' => isset($text_settings['modal_message']) ? $text_settings['modal_message'] : 'Choose which cookies you want to accept.',
            'savePreferencesText' => isset($text_settings['save_preferences']) ? $text_settings['save_preferences'] : 'Save Preferences',
            'cancelText' => isset($text_settings['cancel']) ? $text_settings['cancel'] : 'Cancel',
        ),
    );

    // Instead of localizing the script, add an inline script to initialize it
    wp_add_inline_script('cookiekit-js', '
        window.addEventListener("load", function() {
            if (typeof window.CookieKit !== "undefined") {
                // Initialize using the CookieKit global API
                window.CookieKit.init(' . json_encode($cookiekit_data) . ');
            } else {
                console.error("CookieKit not loaded");
            }
        });
    ');
}
add_action('wp_enqueue_scripts', 'cookiekit_enqueue_scripts');

/**
 * Enqueue admin scripts and styles.
 */
function cookiekit_admin_enqueue_scripts($hook) {
    // Only load on our settings page
    if ($hook !== 'settings_page_cookiekit-settings') {
        return;
    }
    
    // Enqueue WordPress color picker
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');
    
    // Register and enqueue admin styles
    wp_register_style(
        'cookiekit-admin-css',
        COOKIEKIT_PLUGIN_URL . 'assets/css/cookiekit-admin.css',
        array('wp-color-picker'),
        COOKIEKIT_VERSION
    );
    wp_enqueue_style('cookiekit-admin-css');
    
    // Register and enqueue admin script
    wp_register_script(
        'cookiekit-admin-js',
        COOKIEKIT_PLUGIN_URL . 'assets/js/cookiekit-admin.js',
        array('jquery', 'wp-color-picker'),
        COOKIEKIT_VERSION,
        true
    );
    wp_enqueue_script('cookiekit-admin-js');
    
    // Add inline styles for animations
    wp_add_inline_style('cookiekit-admin-css', '
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(30, 140, 190, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(30, 140, 190, 0); }
            100% { box-shadow: 0 0 0 0 rgba(30, 140, 190, 0); }
        }
        
        .pulse-animation {
            animation: pulse 2s infinite;
        }
    ');
    
    // Add inline script for style and theme options selection handling
    wp_add_inline_script('cookiekit-admin-js', '
        jQuery(document).ready(function($) {
            // Add click handler to style option labels
            $(".consent-style-options label").on("click", function() {
                // Remove selected styling from all options
                $(".consent-style-options label").css({
                    "border-color": "#ddd",
                    "background": "#fff"
                }).find("span").css("font-weight", "normal");
                
                // Add selected styling to clicked option
                $(this).css({
                    "border-color": "#2271b1",
                    "background": "#f0f6ff"
                }).find("span").css("font-weight", "bold");
            });
            
            // Add click handler to theme option labels
            $(".theme-options label").on("click", function() {
                // Remove selected styling from all options
                $(".theme-options label").css({
                    "border-color": "#ddd",
                    "background": "#fff"
                }).find("span").css("font-weight", "normal");
                
                // Add selected styling to clicked option
                $(this).css({
                    "border-color": "#2271b1",
                    "background": "#f0f6ff"
                }).find("span").css("font-weight", "bold");
            });
            
            // Add visual indicator for export button
            $("input[name=\"cookiekit_export_settings\"]").css({
                "animation": "pulse 2s infinite"
            });
        });
    ');
    
    // Check for flag to trigger download
    global $should_trigger_download;
    if (isset($should_trigger_download) && $should_trigger_download) {
        // Add AJAX download script
        wp_add_inline_script('cookiekit-admin-js', '
            jQuery(document).ready(function($) {
                $.ajax({
                    url: ajaxurl,
                    data: {
                        action: "cookiekit_download_settings",
                        _wpnonce: "' . esc_js(wp_create_nonce('cookiekit_download_settings')) . '"
                    },
                    success: function(response) {
                        if (response.success) {
                            // Create an invisible link and trigger download
                            var a = document.createElement("a");
                            var blob = new Blob([response.data.content], {type: "application/json"});
                            var url = window.URL.createObjectURL(blob);
                            a.href = url;
                            a.download = response.data.filename;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();
                        } else {
                            alert("' . esc_js(__('Error downloading settings file.', 'cookiekit-gdpr-cookie-consent')) . '");
                        }
                    },
                    error: function() {
                        alert("' . esc_js(__('Error downloading settings file.', 'cookiekit-gdpr-cookie-consent')) . '");
                    }
                });
            });
        ');
    }
}
add_action('admin_enqueue_scripts', 'cookiekit_admin_enqueue_scripts');

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
 * Register settings without any dynamic arguments or sanitize_callback
 */
function cookiekit_register_settings() {
    // Register with proper sanitization callback
    register_setting('cookiekit_options', 'cookiekit_settings', array(
        'type' => 'object',
        'default' => array(
            'cookie_expiration' => 365,
            'cookie_name' => 'cookiekit_consent',
            'style' => 'banner',
            'theme' => 'light',
            'main_color' => '#3b82f6', // Default blue color
            'cookiekit_id' => '',
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
        'sanitize_callback' => 'cookiekit_sanitize_settings',
    ));
}
add_action('admin_init', 'cookiekit_register_settings');

/**
 * Sanitize plugin settings
 */
function cookiekit_sanitize_settings($input) {
    if (!is_array($input)) {
        return array();
    }
    
    $sanitized = array();
    
    // Sanitize scalar values
    $sanitized['cookie_expiration'] = isset($input['cookie_expiration']) ? absint($input['cookie_expiration']) : 365;
    $sanitized['cookie_name'] = isset($input['cookie_name']) ? sanitize_text_field($input['cookie_name']) : 'cookiekit_consent';
    $sanitized['style'] = isset($input['style']) && in_array($input['style'], array('banner', 'popup', 'modal')) ? $input['style'] : 'banner';
    $sanitized['theme'] = isset($input['theme']) && in_array($input['theme'], array('light', 'dark')) ? $input['theme'] : 'light';
    $sanitized['main_color'] = isset($input['main_color']) ? sanitize_hex_color($input['main_color']) : '#3b82f6';
    $sanitized['cookiekit_id'] = isset($input['cookiekit_id']) ? sanitize_text_field($input['cookiekit_id']) : '';
    $sanitized['allowed_domains'] = isset($input['allowed_domains']) ? sanitize_textarea_field($input['allowed_domains']) : '';
    
    // Sanitize text settings
    $sanitized['text_settings'] = array();
    if (isset($input['text_settings']) && is_array($input['text_settings'])) {
        foreach ($input['text_settings'] as $key => $value) {
            $sanitized['text_settings'][$key] = sanitize_text_field($value);
        }
    } else {
        $sanitized['text_settings'] = array(
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
    
    return $sanitized;
}

/**
 * Settings page HTML
 */
function cookiekit_settings_page() {
    global $should_trigger_download;
    
    // Get saved settings
    $settings = get_option('cookiekit_settings');

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
        // Verify nonce
        if (!isset($_POST['cookiekit_import_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cookiekit_import_nonce'])), 'cookiekit_import_action')) {
            add_settings_error(
                'cookiekit_settings',
                'nonce_error',
                __('Security check failed.', 'cookiekit-gdpr-cookie-consent'),
                'error'
            );
        } else {
            // Sanitize the file path
            $import_file = sanitize_text_field($_FILES['cookiekit_import_file']['tmp_name']);
            if (!empty($import_file) && file_exists($import_file)) {
                $import_data = file_get_contents($import_file);
                
                if ($import_data) {
                    $imported_settings = json_decode($import_data, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE && is_array($imported_settings)) {
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
        }
    }
    
    // Handle settings export
    if (isset($_POST['cookiekit_export_settings'])) {
        // Verify nonce
        if (!isset($_POST['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wpnonce'])), 'cookiekit_options-options')) {
            add_settings_error(
                'cookiekit_settings',
                'nonce_error',
                __('Security check failed.', 'cookiekit-gdpr-cookie-consent'),
                'error'
            );
        } else {
            // Instead of using headers directly, we'll use a JavaScript approach
            $export_data = json_encode($settings, JSON_PRETTY_PRINT);
            $filename = 'cookiekit-settings.json';
            
            // Store the export data in a transient
            set_transient('cookiekit_export_data', $export_data, 60 * 5); // 5 minutes expiration
            
            // Set a flag to trigger the JavaScript download
            $should_trigger_download = true;
        }
    }
    
    // Handle sample settings download
    if (isset($_POST['cookiekit_download_sample'])) {
        // Verify nonce
        if (!isset($_POST['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wpnonce'])), 'cookiekit_options-options')) {
            add_settings_error(
                'cookiekit_settings',
                'nonce_error',
                __('Security check failed.', 'cookiekit-gdpr-cookie-consent'),
                'error'
            );
        } else {
            $sample_settings = array(
                'cookie_expiration' => 365,
                'cookie_name' => 'cookiekit_consent',
                'style' => 'banner',
                'theme' => 'light',
                'cookiekit_id' => 'YOUR_COOKIEKIT_ID_HERE',
                'allowed_domains' => "example.com\napi.example.com",
                'text_settings' => array(
                    'title' => 'Cookie Consent',
                    'message' => 'We use cookies to enhance your browsing experience, analyze our traffic, and provide you with a better website experience.',
                    'accept_button' => 'Accept All',
                    'decline_button' => 'Decline All',
                    'customize_button' => 'Manage Preferences',
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
    }
    ?>
    <div class="wrap">
        <!-- CookieKit Logo and Header -->
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="margin-right: 15px;">
                <img src="<?php echo esc_url(COOKIEKIT_PLUGIN_URL . 'assets/cookiekit-logo.png'); ?>" 
                     alt="CookieKit Logo" 
                     style="width: 60px; height: auto;" 
                     class="cookiekit-logo" />
            </div>
            <div>
                <h1 style="margin: 0;">CookieKit: GDPR & Cookie Consent</h1>
                <p class="description">Version: <?php echo esc_html(COOKIEKIT_VERSION); ?></p>
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
                    <th scope="row">Consent Style</th>
                    <td>
                        <div class="consent-style-options" style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border: 2px solid <?php echo $settings['style'] === 'banner' ? '#2271b1' : '#ddd'; ?>; border-radius: 6px; width: 120px; background: <?php echo $settings['style'] === 'banner' ? '#f0f6ff' : '#fff'; ?>;">
                                <div style="margin-bottom: 10px; width: 100px; height: 70px; background: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; position: relative; overflow: hidden;">
                                    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 20px; background: #2271b1; display: flex; justify-content: center; align-items: center;">
                                        <span style="color: white; font-size: 9px;">Banner</span>
                                    </div>
                                </div>
                                <input type="radio" name="cookiekit_settings[style]" value="banner" <?php checked($settings['style'], 'banner'); ?> style="margin-top: 5px;">
                                <span style="font-size: 13px; margin-top: 5px; font-weight: <?php echo $settings['style'] === 'banner' ? 'bold' : 'normal'; ?>;">Banner</span>
                            </label>
                            
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border: 2px solid <?php echo $settings['style'] === 'popup' ? '#2271b1' : '#ddd'; ?>; border-radius: 6px; width: 120px; background: <?php echo $settings['style'] === 'popup' ? '#f0f6ff' : '#fff'; ?>;">
                                <div style="margin-bottom: 10px; width: 100px; height: 70px; background: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; position: relative; overflow: hidden;">
                                    <div style="position: absolute; bottom: 5px; left: 5px; width: 40px; height: 30px; background: #2271b1; border-radius: 3px; display: flex; justify-content: center; align-items: center;">
                                        <span style="color: white; font-size: 8px;">Popup</span>
                                    </div>
                                </div>
                                <input type="radio" name="cookiekit_settings[style]" value="popup" <?php checked($settings['style'], 'popup'); ?> style="margin-top: 5px;">
                                <span style="font-size: 13px; margin-top: 5px; font-weight: <?php echo $settings['style'] === 'popup' ? 'bold' : 'normal'; ?>;">Popup</span>
                            </label>
                            
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border: 2px solid <?php echo $settings['style'] === 'modal' ? '#2271b1' : '#ddd'; ?>; border-radius: 6px; width: 120px; background: <?php echo $settings['style'] === 'modal' ? '#f0f6ff' : '#fff'; ?>;">
                                <div style="margin-bottom: 10px; width: 100px; height: 70px; background: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; position: relative; overflow: hidden;">
                                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 40px; background: #2271b1; border-radius: 3px; display: flex; justify-content: center; align-items: center;">
                                        <span style="color: white; font-size: 9px;">Modal</span>
                                    </div>
                                </div>
                                <input type="radio" name="cookiekit_settings[style]" value="modal" <?php checked($settings['style'], 'modal'); ?> style="margin-top: 5px;">
                                <span style="font-size: 13px; margin-top: 5px; font-weight: <?php echo $settings['style'] === 'modal' ? 'bold' : 'normal'; ?>;">Modal</span>
                            </label>
                        </div>
                        <p class="description">
                            <strong>Banner:</strong> Full-width banner at the bottom of the screen<br>
                            <strong>Popup:</strong> Compact popup in the bottom-left corner<br>
                            <strong>Modal:</strong> Centered modal with overlay background
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Theme</th>
                    <td>
                        <div class="theme-options" style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border: 2px solid <?php echo $settings['theme'] === 'light' ? '#2271b1' : '#ddd'; ?>; border-radius: 6px; width: 120px; background: <?php echo $settings['theme'] === 'light' ? '#f0f6ff' : '#fff'; ?>;">
                                <div style="margin-bottom: 10px; width: 100px; height: 70px; background: #ffffff; border: 1px solid #ddd; border-radius: 4px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;">
                                    <div style="height: 20px; background: #f0f0f0; border-top: 1px solid #ddd; display: flex; justify-content: center; align-items: center;">
                                        <div style="width: 40px; height: 6px; background: #2271b1; border-radius: 3px;"></div>
                                    </div>
                                </div>
                                <input type="radio" name="cookiekit_settings[theme]" value="light" <?php checked($settings['theme'], 'light'); ?> style="margin-top: 5px;">
                                <span style="font-size: 13px; margin-top: 5px; font-weight: <?php echo $settings['theme'] === 'light' ? 'bold' : 'normal'; ?>;">Light</span>
                            </label>
                            
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border: 2px solid <?php echo $settings['theme'] === 'dark' ? '#2271b1' : '#ddd'; ?>; border-radius: 6px; width: 120px; background: <?php echo $settings['theme'] === 'dark' ? '#f0f6ff' : '#fff'; ?>;">
                                <div style="margin-bottom: 10px; width: 100px; height: 70px; background: #1e1e1e; border: 1px solid #ddd; border-radius: 4px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;">
                                    <div style="height: 20px; background: #2c2c2c; border-top: 1px solid #444; display: flex; justify-content: center; align-items: center;">
                                        <div style="width: 40px; height: 6px; background: #3b82f6; border-radius: 3px;"></div>
                                    </div>
                                </div>
                                <input type="radio" name="cookiekit_settings[theme]" value="dark" <?php checked($settings['theme'], 'dark'); ?> style="margin-top: 5px;">
                                <span style="font-size: 13px; margin-top: 5px; font-weight: <?php echo $settings['theme'] === 'dark' ? 'bold' : 'normal'; ?>;">Dark</span>
                            </label>
                        </div>
                        <p class="description">Choose between light and dark theme for the consent UI</p>
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
                    <th scope="row">Main Color</th>
                    <td>
                        <input type="text" name="cookiekit_settings[main_color]" 
                               value="<?php echo esc_attr(isset($settings['main_color']) ? $settings['main_color'] : '#3b82f6'); ?>" 
                               class="cookiekit-color-picker" data-default-color="#3b82f6">
                        <p class="description">Choose the main color for buttons and accents in the cookie consent UI</p>
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
                                3. Copy your project ID and paste it above<br>
                                4. Become GDPR compliant
                            </p>
                        </div>
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
            <h2 style="margin-top: 0;"><?php esc_html_e('Import/Export Settings', 'cookiekit-gdpr-cookie-consent'); ?></h2>
            <p><?php esc_html_e('Quickly configure your plugin by importing settings from a JSON file or export your current settings for backup or use on another site.', 'cookiekit-gdpr-cookie-consent'); ?></p>
            
            <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                <!-- Import Settings -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-top: 0;"><?php esc_html_e('Import Settings', 'cookiekit-gdpr-cookie-consent'); ?></h3>
                    <p><?php esc_html_e('Upload a JSON file to import settings. This will overwrite your current settings.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    <ol style="margin-left: 1.5em;">
                        <li><?php esc_html_e('Create a JSON file with your settings', 'cookiekit-gdpr-cookie-consent'); ?></li>
                        <li><?php esc_html_e('Click "Choose File" and select your JSON file', 'cookiekit-gdpr-cookie-consent'); ?></li>
                        <li><?php esc_html_e('Click "Import Settings" to apply the settings', 'cookiekit-gdpr-cookie-consent'); ?></li>
                    </ol>
                    <form method="post" enctype="multipart/form-data">
                        <?php wp_nonce_field('cookiekit_import_action', 'cookiekit_import_nonce'); ?>
                        <input type="file" name="cookiekit_import_file" accept=".json" style="margin-bottom: 10px; display: block;">
                        <?php submit_button(__('Import Settings', 'cookiekit-gdpr-cookie-consent'), 'secondary', 'cookiekit_import_settings', false); ?>
                    </form>
                </div>
                
                <!-- Export Settings -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-top: 0;"><?php esc_html_e('Export Settings', 'cookiekit-gdpr-cookie-consent'); ?></h3>
                    <p><?php esc_html_e('Download your current settings as a JSON file for backup or use on another site.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    <form method="post" style="margin-bottom: 15px;">
                        <?php submit_button(__('Export Current Settings', 'cookiekit-gdpr-cookie-consent'), 'primary', 'cookiekit_export_settings', false, array(
                            'title' => __('Keyboard shortcut: Alt+E', 'cookiekit-gdpr-cookie-consent'),
                            'accesskey' => 'e',
                            'style' => 'position: relative;'
                        )); ?>
                        <p class="description"><?php esc_html_e('Tip: Use Alt+E (Windows) or Option+E (Mac) to quickly export settings.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    </form>
                    
                    <h4><?php esc_html_e('Need a template?', 'cookiekit-gdpr-cookie-consent'); ?></h4>
                    <p><?php esc_html_e('Download a sample settings file to use as a template for creating your own settings file.', 'cookiekit-gdpr-cookie-consent'); ?></p>
                    <form method="post">
                        <?php submit_button(__('Download Sample Template', 'cookiekit-gdpr-cookie-consent'), 'secondary', 'cookiekit_download_sample', false); ?>
                    </form>
                </div>
            </div>
        </div>
    </div>
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
            'main_color' => '#3b82f6', // Default blue color
            'cookiekit_id' => '',
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

/**
 * Register plugin logo for the admin area
 */
function cookiekit_register_logo() {
    // Add logo to media library if it doesn't exist
    $logo_attachment_id = get_option('cookiekit_logo_id', 0);
    $logo_path = COOKIEKIT_PLUGIN_DIR . 'assets/cookiekit-logo.png';
    $logo_url = COOKIEKIT_PLUGIN_URL . 'assets/cookiekit-logo.png';
    
    // Only continue if the logo file exists and we don't already have an attachment ID
    if (file_exists($logo_path) && empty($logo_attachment_id)) {
        // Try to find the attachment by URL - more efficient than meta_query
        $logo_attachment_id = attachment_url_to_postid($logo_url);
        
        // If not found, add the logo to the media library
        if (empty($logo_attachment_id)) {
            $filetype = wp_check_filetype(basename($logo_path), null);
            $attachment = array(
                'guid' => $logo_url,
                'post_mime_type' => $filetype['type'],
                'post_title' => 'CookieKit Logo',
                'post_content' => '',
                'post_status' => 'inherit'
            );
            
            $logo_attachment_id = wp_insert_attachment($attachment, $logo_path);
            
            if (!is_wp_error($logo_attachment_id)) {
                // Generate attachment metadata
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                $attachment_data = wp_generate_attachment_metadata($logo_attachment_id, $logo_path);
                wp_update_attachment_metadata($logo_attachment_id, $attachment_data);
            }
        }
        
        // Store the attachment ID
        update_option('cookiekit_logo_id', $logo_attachment_id);
    }
}
add_action('admin_init', 'cookiekit_register_logo');

/**
 * Empty function for backward compatibility
 * All initialization is now handled by cookiekit_enqueue_scripts
 */
function cookiekit_init() {
    // This function is intentionally left empty
    // All initialization is now handled through proper wp_enqueue_scripts and cookiekit_enqueue_scripts
}
add_action('wp_footer', 'cookiekit_init'); 
    // Get saved settings
    $settings = get_option('cookiekit_settings', array());
    $text_settings = isset($settings['text_settings']) ? $settings['text_settings'] : array();
    
    $cookiekit_data = array(
        'cookieName' => isset($settings['cookie_name']) ? $settings['cookie_name'] : 'cookiekit_consent',
        'cookieExpiration' => isset($settings['cookie_expiration']) ? intval($settings['cookie_expiration']) : 365,
        'privacyPolicy' => get_privacy_policy_url(),
        'style' => isset($settings['style']) ? $settings['style'] : 'banner',
        'theme' => isset($settings['theme']) && $settings['theme'] !== 'auto' ? $settings['theme'] : null,
        'autoDetectTheme' => isset($settings['theme']) && $settings['theme'] === 'auto' ? true : false,
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
        )
    ));
}

function cookiekit_sanitize_settings($input) {
    if (!is_array($input)) {
        return array();
    }
    
    $sanitized = array();
    
    // Sanitize scalar values
    $sanitized['cookie_expiration'] = isset($input['cookie_expiration']) ? absint($input['cookie_expiration']) : 365;
    $sanitized['cookie_name'] = isset($input['cookie_name']) ? sanitize_text_field($input['cookie_name']) : 'cookiekit_consent';
    $sanitized['style'] = isset($input['style']) && in_array($input['style'], array('banner', 'popup', 'modal')) ? $input['style'] : 'banner';
    $sanitized['theme'] = isset($input['theme']) && in_array($input['theme'], array('light', 'dark', 'auto')) ? $input['theme'] : 'light';
    $sanitized['main_color'] = isset($input['main_color']) ? sanitize_hex_color($input['main_color']) : '#3b82f6';
    $sanitized['cookiekit_id'] = isset($input['cookiekit_id']) ? sanitize_text_field($input['cookiekit_id']) : '';
    $sanitized['allowed_domains'] = isset($input['allowed_domains']) && !empty($input['allowed_domains']) 
        ? array_filter(array_map('trim', explode("\n", $input['allowed_domains'])))
        : array();
    $sanitized['text_settings'] = isset($input['text_settings']) && is_array($input['text_settings']) ? $input['text_settings'] : array(
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
    
    return $sanitized;
}

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
                            
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border: 2px solid <?php echo $settings['theme'] === 'auto' ? '#2271b1' : '#ddd'; ?>; border-radius: 6px; width: 120px; background: <?php echo $settings['theme'] === 'auto' ? '#f0f6ff' : '#fff'; ?>;">
                                <div style="margin-bottom: 10px; width: 100px; height: 70px; background: linear-gradient(to right, #ffffff 50%, #1e1e1e 50%); border: 1px solid #ddd; border-radius: 4px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;">
                                    <div style="height: 20px; background: linear-gradient(to right, #f0f0f0 50%, #2c2c2c 50%); border-top: 1px solid #ddd; display: flex; justify-content: center; align-items: center;">
                                        <div style="width: 40px; height: 6px; background: #3b82f6; border-radius: 3px;"></div>
                                    </div>
                                </div>
                                <input type="radio" name="cookiekit_settings[theme]" value="auto" <?php checked($settings['theme'], 'auto'); ?> style="margin-top: 5px;">
                                <span style="font-size: 13px; margin-top: 5px; font-weight: <?php echo $settings['theme'] === 'auto' ? 'bold' : 'normal'; ?>;">Auto-detect</span>
                            </label>
                        </div>
                        <p class="description">Choose between light, dark, or auto-detect theme for the consent UI</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Cookie Expiration (days)</th>
                    <td>
                        <input type="number" name="cookiekit_settings[cookie_expiration]" value="<?php echo $settings['cookie_expiration']; ?>" min="1" max="365" style="width: 100px;">
                        <p class="description">Enter the number of days the cookie should last</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Main Color</th>
                    <td>
                        <input type="color" name="cookiekit_settings[main_color]" value="<?php echo $settings['main_color']; ?>" style="width: 100px;">
                        <p class="description">Choose the main color for the consent UI</p>
                    </td>
                </tr>

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
        'theme' => isset($settings['theme']) && $settings['theme'] !== 'auto' ? $settings['theme'] : null,
        'autoDetectTheme' => isset($settings['theme']) && $settings['theme'] === 'auto' ? true : false,
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
            'theme' => 'light', // Can be 'light', 'dark', or 'auto'
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
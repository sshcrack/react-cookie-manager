/**
 * CookieKit Admin JavaScript
 */
(function ($) {
  "use strict";

  $(document).ready(function () {
    // Add visual indicator for export button
    $('input[name="cookiekit_export_settings"]').addClass("pulse-animation");

    // Handle style option selection
    $(".consent-style-options label").on("click", function () {
      // Remove selected styling from all options
      $(".consent-style-options label")
        .css({
          "border-color": "#ddd",
          background: "#fff",
        })
        .find("span")
        .css("font-weight", "normal");

      // Add selected styling to clicked option
      $(this)
        .css({
          "border-color": "#2271b1",
          background: "#f0f6ff",
        })
        .find("span")
        .css("font-weight", "bold");
    });

    // Handle theme option selection
    $(".theme-options label").on("click", function () {
      // Remove selected styling from all options
      $(".theme-options label")
        .css({
          "border-color": "#ddd",
          background: "#fff",
        })
        .find("span")
        .css("font-weight", "normal");

      // Add selected styling to clicked option
      $(this)
        .css({
          "border-color": "#2271b1",
          background: "#f0f6ff",
        })
        .find("span")
        .css("font-weight", "bold");
    });

    // Handle file import
    $("#settings_import_file").on("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const settings = JSON.parse(e.target.result);
          $("#import_settings_json").val(e.target.result);
          $("#settings_import_filename").text(file.name);
          $("#cookiekit_import_settings").prop("disabled", false);
        } catch (err) {
          alert("Invalid settings file. Please upload a valid JSON file.");
          $("#settings_import_file").val("");
          $("#settings_import_filename").text("");
          $("#cookiekit_import_settings").prop("disabled", true);
        }
      };
      reader.readAsText(file);
    });

    // Select all text in code blocks when clicked
    $(".cookiekit-code-block").on("click", function () {
      const range = document.createRange();
      range.selectNodeContents(this);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    });
  });
})(jQuery);

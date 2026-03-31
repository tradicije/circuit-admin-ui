<?php
/**
 * Plugin Name: Circuit Admin UI
 * Description: Modern, fully custom WordPress admin UI theme with dark/light switch and note-editor style post composer.
 * Version: 1.0.0
 * Author: Circuit
 * Text Domain: circuit-admin-ui
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . 'includes/class-circuit-admin-ui.php';

function circuit_admin_ui_bootstrap() {
	$plugin = new Circuit_Admin_UI();
	$plugin->init();
}

circuit_admin_ui_bootstrap();

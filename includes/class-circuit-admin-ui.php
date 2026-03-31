<?php
/**
 * Circuit Admin UI core class.
 */
class Circuit_Admin_UI {
	const VERSION = '1.0.0';

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
		add_filter( 'admin_body_class', array( $this, 'add_theme_body_class' ) );
		add_action( 'admin_bar_menu', array( $this, 'register_theme_switcher' ), 100 );
		add_action( 'wp_ajax_circuit_admin_ui_set_theme', array( $this, 'ajax_set_theme' ) );
	}

	/**
	 * Enqueue global admin assets.
	 *
	 * @return void
	 */
	public function enqueue_admin_assets() {
		$theme = $this->get_user_theme();

		wp_enqueue_style(
			'circuit-admin-ui-style',
			plugin_dir_url( __DIR__ ) . 'assets/css/admin.css',
			array(),
			self::VERSION
		);

		wp_enqueue_script(
			'circuit-admin-ui-script',
			plugin_dir_url( __DIR__ ) . 'assets/js/admin.js',
			array(),
			self::VERSION,
			true
		);

		wp_localize_script(
			'circuit-admin-ui-script',
			'CircuitAdminUI',
			array(
				'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
				'nonce'        => wp_create_nonce( 'circuit_admin_ui_nonce' ),
				'currentTheme' => $theme,
				'i18n'         => array(
					'light' => __( 'Switch to light mode', 'circuit-admin-ui' ),
					'dark'  => __( 'Switch to dark mode', 'circuit-admin-ui' ),
				),
			),
		);
	}

	/**
	 * Enqueue editor-specific styles.
	 *
	 * @return void
	 */
	public function enqueue_block_editor_assets() {
		wp_enqueue_style(
			'circuit-admin-ui-editor-style',
			plugin_dir_url( __DIR__ ) . 'assets/css/editor.css',
			array(),
			self::VERSION
		);
	}

	/**
	 * Add body class with chosen theme.
	 *
	 * @param string $classes Existing classes.
	 * @return string
	 */
	public function add_theme_body_class( $classes ) {
		$theme = $this->get_user_theme();

		$classes .= ' caiu-theme-' . sanitize_html_class( $theme );
		$classes .= ' caiu-admin';

		if ( 'post-new.php' === $GLOBALS['pagenow'] ) {
			$classes .= ' caiu-note-editor';
		}

		return $classes;
	}

	/**
	 * Add theme switcher into admin bar.
	 *
	 * @param WP_Admin_Bar $wp_admin_bar Admin bar object.
	 * @return void
	 */
	public function register_theme_switcher( $wp_admin_bar ) {
		if ( ! is_admin() ) {
			return;
		}

		$theme = $this->get_user_theme();

		$wp_admin_bar->add_node(
			array(
				'id'    => 'circuit-admin-ui-theme-toggle',
				'title' => '<span class="ab-icon caiu-toggle-icon" aria-hidden="true"></span><span class="ab-label caiu-toggle-label">' . esc_html( ucfirst( $theme ) ) . '</span>',
				'href'  => '#',
				'meta'  => array(
					'class' => 'caiu-theme-toggle',
					'title' => esc_attr__( 'Toggle dark/light mode', 'circuit-admin-ui' ),
				),
			)
		);
	}

	/**
	 * Save user-selected theme mode.
	 *
	 * @return void
	 */
	public function ajax_set_theme() {
		check_ajax_referer( 'circuit_admin_ui_nonce', 'nonce' );

		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ), 403 );
		}

		$theme = isset( $_POST['theme'] ) ? sanitize_text_field( wp_unslash( $_POST['theme'] ) ) : 'dark';

		if ( ! in_array( $theme, array( 'light', 'dark' ), true ) ) {
			$theme = 'dark';
		}

		update_user_meta( get_current_user_id(), 'circuit_admin_ui_theme', $theme );

		wp_send_json_success( array( 'theme' => $theme ) );
	}

	/**
	 * Read current user theme setting.
	 *
	 * @return string
	 */
	private function get_user_theme() {
		$theme = get_user_meta( get_current_user_id(), 'circuit_admin_ui_theme', true );

		if ( ! in_array( $theme, array( 'light', 'dark' ), true ) ) {
			$theme = 'dark';
		}

		return $theme;
	}
}

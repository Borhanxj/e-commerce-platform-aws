exports.options = { transaction: false };

exports.up = (pgm) => {
  pgm.createTable({ schema: 'public', name: 'system_settings' }, {
    key:        { type: 'varchar(100)', primaryKey: true },
    value:      { type: 'text', notNull: true },
    label:      { type: 'varchar(255)', notNull: true },
    type:       { type: 'varchar(50)', notNull: true, default: pgm.func("'text'") },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // Seed default settings
  pgm.sql(`
    INSERT INTO system_settings (key, value, label, type) VALUES
      ('app_name', 'MODÉ', 'Application Name', 'text'),
      ('maintenance_mode', 'false', 'Maintenance Mode', 'boolean'),
      ('contact_email', 'support@mode.com', 'Contact Email', 'text'),
      ('max_order_items', '50', 'Max Items Per Order', 'number'),
      ('currency', 'USD', 'Currency', 'text'),
      ('free_shipping_threshold', '100', 'Free Shipping Threshold ($)', 'number')
    ON CONFLICT DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'public', name: 'system_settings' });
};

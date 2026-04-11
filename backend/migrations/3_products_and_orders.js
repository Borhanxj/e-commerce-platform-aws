exports.options = { transaction: false }

exports.up = async (pgm) => {
  // ─── Products ──────────────────────────────────────
  pgm.createTable(
    { schema: 'public', name: 'products' },
    {
      id: { type: 'serial', primaryKey: true },
      name: { type: 'varchar(255)', notNull: true },
      description: { type: 'text' },
      price: { type: 'numeric(10,2)', notNull: true },
      stock: { type: 'integer', notNull: true, default: 0 },
      category: { type: 'varchar(100)' },
      image_url: { type: 'varchar(500)' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    }
  )

  // ─── Order status enum ─────────────────────────────
  pgm.createType('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])

  // ─── Orders ────────────────────────────────────────
  pgm.createTable(
    { schema: 'public', name: 'orders' },
    {
      id: { type: 'serial', primaryKey: true },
      user_id: {
        type: 'integer',
        notNull: true,
        references: '"auth"."users"(id)',
        onDelete: 'CASCADE',
      },
      status: { type: 'order_status', notNull: true, default: 'pending' },
      total: { type: 'numeric(10,2)', notNull: true, default: 0 },
      address: { type: 'text' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    }
  )

  // ─── Order items ───────────────────────────────────
  pgm.createTable(
    { schema: 'public', name: 'order_items' },
    {
      id: { type: 'serial', primaryKey: true },
      order_id: { type: 'integer', notNull: true, references: '"orders"(id)', onDelete: 'CASCADE' },
      product_id: {
        type: 'integer',
        notNull: true,
        references: '"products"(id)',
        onDelete: 'CASCADE',
      },
      quantity: { type: 'integer', notNull: true, default: 1 },
      price: { type: 'numeric(10,2)', notNull: true },
    }
  )
}

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'public', name: 'order_items' })
  pgm.dropTable({ schema: 'public', name: 'orders' })
  pgm.dropType('order_status')
  pgm.dropTable({ schema: 'public', name: 'products' })
}

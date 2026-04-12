exports.options = { transaction: false }

exports.up = async (pgm) => {
  pgm.createTable(
    { schema: 'public', name: 'wishlist_items' },
    {
      user_id: {
        type: 'integer',
        notNull: true,
        references: '"auth"."users"(id)',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: 'integer',
        notNull: true,
        references: '"products"(id)',
        onDelete: 'CASCADE',
      },
      added_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    },
    {
      constraints: {
        primaryKey: ['user_id', 'product_id'],
      },
    }
  )
}

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'public', name: 'wishlist_items' })
}

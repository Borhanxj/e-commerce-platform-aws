exports.options = { transaction: false }

exports.up = async (pgm) => {
  pgm.createTable(
    { schema: 'public', name: 'product_discounts' },
    {
      product_id: {
        type: 'integer',
        notNull: true,
        unique: true,
        references: '"products"(id)',
        onDelete: 'CASCADE',
      },
      discount_percent: { type: 'integer', notNull: true },
      created_by: {
        type: 'integer',
        notNull: true,
        references: '"auth"."users"(id)',
        onDelete: 'CASCADE',
      },
      start_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
      end_at: { type: 'timestamptz' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    },
    {
      constraints: {
        primaryKey: ['product_id'],
      },
    }
  )

  pgm.addConstraint(
    { schema: 'public', name: 'product_discounts' },
    'product_discounts_discount_percent_range',
    'CHECK (discount_percent BETWEEN 1 AND 100)'
  )

  pgm.addConstraint(
    { schema: 'public', name: 'product_discounts' },
    'product_discounts_end_after_start',
    'CHECK (end_at IS NULL OR end_at > start_at)'
  )
}

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'public', name: 'product_discounts' })
}

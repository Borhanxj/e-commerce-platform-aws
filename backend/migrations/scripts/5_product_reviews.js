exports.options = { transaction: false }

exports.up = (pgm) => {
  pgm.createType('review_status', ['pending', 'approved', 'rejected'])

  pgm.createTable(
    { schema: 'public', name: 'product_reviews' },
    {
      id: { type: 'serial', primaryKey: true },
      product_id: {
        type: 'integer',
        notNull: true,
        references: '"products"(id)',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: 'integer',
        notNull: true,
        references: '"auth"."users"(id)',
        onDelete: 'CASCADE',
      },
      rating: { type: 'integer' },
      content: { type: 'text' },
      status: { type: 'review_status', notNull: true, default: "'pending'" },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    }
  )
}

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'public', name: 'product_reviews' })
  pgm.dropType('review_status')
}

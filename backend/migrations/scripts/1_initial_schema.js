exports.up = (pgm) => {
  pgm.createSchema('auth')

  pgm.createType({ schema: 'auth', name: 'user_role' }, [
    'customer',
    'sales_manager',
    'product_manager',
  ])

  pgm.createTable(
    { schema: 'auth', name: 'users' },
    {
      id: { type: 'serial', primaryKey: true },
      email: { type: 'varchar(255)', notNull: true, unique: true },
      password_hash: { type: 'varchar(255)', notNull: true },
      role: { type: 'auth.user_role', notNull: true, default: 'customer' },
      reset_token: { type: 'varchar(255)' },
      reset_token_expires_at: { type: 'timestamptz' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    }
  )

  pgm.createTable(
    { schema: 'auth', name: 'customers' },
    {
      customer_id: {
        type: 'int',
        primaryKey: true,
        references: '"auth"."users"(id)',
        onDelete: 'CASCADE',
      },
      name: { type: 'varchar(100)', notNull: true },
      tax_id: { type: 'varchar(50)', notNull: true, unique: true },
      home_address: { type: 'text', notNull: true },
    }
  )

  pgm.createTable(
    { schema: 'auth', name: 'sales_managers' },
    {
      sales_manager_id: {
        type: 'int',
        primaryKey: true,
        references: '"auth"."users"(id)',
        onDelete: 'CASCADE',
      },
      name: { type: 'varchar(100)', notNull: true },
    }
  )

  pgm.createTable(
    { schema: 'auth', name: 'product_managers' },
    {
      product_manager_id: {
        type: 'int',
        primaryKey: true,
        references: '"auth"."users"(id)',
        onDelete: 'CASCADE',
      },
      name: { type: 'varchar(100)', notNull: true },
    }
  )
}

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'auth', name: 'product_managers' })
  pgm.dropTable({ schema: 'auth', name: 'sales_managers' })
  pgm.dropTable({ schema: 'auth', name: 'customers' })
  pgm.dropTable({ schema: 'auth', name: 'users' })
  pgm.dropType({ schema: 'auth', name: 'user_role' })
  pgm.dropSchema('auth')
}

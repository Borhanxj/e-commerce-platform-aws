exports.options = { transaction: false };

exports.up = (pgm) => {
  pgm.sql("ALTER TYPE auth.user_role ADD VALUE IF NOT EXISTS 'admin'");
};

exports.down = () => {
  // PostgreSQL does not support removing individual enum values.
  // To roll back, manually recreate the type without 'admin'
  // only if no rows reference it.
};

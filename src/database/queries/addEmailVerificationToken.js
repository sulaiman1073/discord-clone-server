module.exports = async (db, { email }) => {
  await db.query(
    /* SQL */ `
  INSERT INTO
    email_verification_tokens
    (
      user_id
    )
  VALUES
    (
      SELECT
        id
      FROM
        users
      WHERE
        email = $1
    )
  RETURNING
    verification_token`,
    [email]
  );
};

const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (db, { email, verificationToken }) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    UPDATE
      users
    SET
      email_verified = TRUE,
      updated_at = NOW()
    WHERE
      email = $1
      AND EXISTS (
        SELECT
          1
        FROM
          email_verification_tokens as evt
        WHERE
          evt.user_id = users.id
          AND evt.verification_token = $2
      )
    RETURNING
      id AS "id",
      first_name AS "firstName",
      last_name AS "lastName",
      username AS "username",
      email AS "email",
      date_of_birth AS "dateOfBirth",
      avatar AS "avatar",
      email_verified AS "emailVerified",
      created_at AS "joinDate"`,
        [email, verificationToken]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};

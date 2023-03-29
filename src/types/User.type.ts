export default interface IUser {
  // The user id
  user: string;

  // A reference to the last id the user has voted on
  // It's not ideal, but we are not dealing with a SQL
  // db
  last_vote_id: string;
}

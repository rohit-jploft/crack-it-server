let users: any = [];

//add user to connected user
const addUser = (userId: string, socketId: string) => {
  !users.some((user: any) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const getAllUsers = () => {
    return users;
}

//remove user from connected userList
const removeUser = (socketId: string) => {
  users = users.filter((user: any) => user.socketId !== socketId);
};

//get user
const getUser = (userId: string) => {
  const user = users.find((user: any) => user.userId === userId);
  return user;
};

export { addUser, removeUser, getUser ,getAllUsers};

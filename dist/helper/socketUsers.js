"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getUser = exports.removeUser = exports.addUser = void 0;
let users = [];
//add user to connected user
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};
exports.addUser = addUser;
const getAllUsers = () => {
    return users;
};
exports.getAllUsers = getAllUsers;
//remove user from connected userList
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};
exports.removeUser = removeUser;
//get user
const getUser = (userId) => {
    const user = users.find((user) => user.userId === userId);
    return user;
};
exports.getUser = getUser;

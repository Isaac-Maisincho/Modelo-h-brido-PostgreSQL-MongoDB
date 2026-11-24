// src/services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../db/prisma");
const HttpError = require("../utils/httpError");

const registerUser = async (email, password, name) => {
  if (!email || !password || !name) {
    throw new HttpError(400, "Nombre, email y contraseña son obligatorios");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: "USER" },
  });
  return newUser;
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new HttpError(400, "Email y contraseña son obligatorios");
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(401, "Email o contraseña incorrectos");
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new HttpError(401, "Email o contraseña incorrectos");
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "4h" },
  );
  return token;
};

module.exports = { registerUser, loginUser };

// src/controllers/authController.js
const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    await registerUser(email, password, name);
    return res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    return res.json({ token });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };

const USER = {
  username: "adminFood",
  password: "Food123",
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    return res.status(200).json({
      success: true,
      message: "Login exitoso",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Usuario o contraseña incorrectos",
  });
};

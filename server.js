const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = '123456789';
const expiresIn = '1h';

server.use(middlewares);
server.use(jsonServer.bodyParser);

// --- FUNCIONES AUXILIARES ---
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err);
}

// --- ENDPOINT: LOGIN ---
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Buscamos en la tabla 'users'
  const user = router.db.get('users').find({ email, password }).value();

  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas, agente.' });
  }
  console.log('User: ', user)
  const token = createToken({ id: user.id, nombre: user.nombre, email: user.email, role: user.role, alias: user.alias });
  
  // Devolvemos token y datos básicos del usuario (sin password)
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({ token, user: userWithoutPassword });
});

// --- ENDPOINT: VERIFICAR TOKEN (Para Guards) ---
server.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Decoded: ', decoded)
    res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Token expirado o inválido' });
  }
});

// --- ENDPOINT PÚBLICO: REGISTRO DE ASPIRANTES ---
// Interceptamos antes del middleware de auth para que sea público
server.post('/aspirantes', (req, res, next) => {
  // Simplemente pasamos al router de json-server, permitiendo la creación sin token
  next();
});

// --- MIDDLEWARE DE AUTENTICACIÓN GLOBAL ---
server.use((req, res, next) => {
  // 1. Permitir registro de aspirantes (ya manejado arriba, pero por seguridad doble)
  if (req.path === '/aspirantes' && req.method === 'POST') {
    return next();
  }

  // 2. Verificar cabecera Authorization
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    return res.status(401).json({ status: 401, message: 'Falta token de seguridad o formato incorrecto' });
  }

  const token = req.headers.authorization.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Guardamos info del usuario en la request
  } catch (err) {
    return res.status(401).json({ status: 401, message: 'Token revocado o corrupto' });
  }

  // --- CONTROL DE ROLES (RBAC) ---
  
  // Regla: Solo ADMIN puede modificar Usuarios o Misiones (POST, PUT, DELETE)
  // Los Agentes solo pueden LEER (GET) o modificar cosas muy específicas (aquí simplificamos: solo Admin escribe en misiones)
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isMissionOrUserPath = req.path.startsWith('/misiones') || req.path.startsWith('/users');

  if (isWriteMethod && isMissionOrUserPath) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 403, 
        message: 'Acceso Denegado: Nivel de autorización insuficiente para modificar archivos de la agencia.' 
      });
    }
  }

  next();
});

server.use(router);

server.listen(3000, () => {
  console.log('📡 Servidor C.R.Y.P.T.O. escuchando en el puerto 3000');
  console.log('🔓 Endpoint Público: POST /aspirantes');
  console.log('🔐 Endpoint Privado: Todo lo demás');
});
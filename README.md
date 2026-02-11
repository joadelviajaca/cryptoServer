📂 DOCUMENTACIÓN CLASIFICADA: API C.R.Y.P.T.O. v1.0Estado del Servidor: ACTIVOBase URL: http://localhost:3000Seguridad: JWT (JSON Web Token)🔐 1. Credenciales de Acceso (Usuarios de Prueba)Utilice estas cuentas para probar los diferentes niveles de autorización en la aplicación.RolNombreEmail (Login)PasswordPermisosADMINOlivia Mansfield (M)m@crypto.com123Control Total (Crear/Borrar Misiones y Usuarios)AGENTEJames Bond (007)bond@crypto.com123Solo Lectura de Misiones y Perfil PropioAGENTEEthan Hunt (ECHO)hunt@crypto.com123Solo Lectura de Misiones y Perfil Propio📡 2. Endpoints de AutenticaciónIniciar Sesión (Login)Método: POSTURL: /loginBody:JSON{
  "email": "m@crypto.com",
  "password": "123"
}
Respuesta Exitosa (200):JSON{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "email": "m@crypto.com",
    "nombre": "Olivia Mansfield",
    "alias": "M",
    "role": "admin"
  }
}
Verificar Token (Para Guards)Método: GETURL: /verifyHeader Requerido: Authorization: Bearer <TOKEN>Uso: Verificar si el token almacenado en LocalStorage sigue siendo válido al recargar la página.🌍 3. Zona Pública (Sin Token)Registrar Nuevo AspiranteMétodo: POSTURL: /aspirantesDescripción: Cualquiera puede enviar su solicitud. No requiere autenticación.Body:JSON{
  "nombre": "Jason Bourne",
  "alias": "TREADSTONE",
  "email": "jason@unknown.com",
  "nacionalidad": "USA"
}
🚫 4. Zona Privada (Requiere Token)⚠️ IMPORTANTE: Todas las peticiones a continuación requieren el header:Authorization: Bearer <TU_TOKEN_AQUÍ>Gestión de MisionesMétodoURLDescripciónPermiso RequeridoGET/misionesObtener todas las misionesAgente / AdminGET/misiones/:idObtener una misión por IDAgente / AdminPOST/misionesCrear nueva misiónSOLO ADMINPUT/misiones/:idEditar misión existenteSOLO ADMINDELETE/misiones/:idEliminar misiónSOLO ADMINEjemplo Body para Crear Misión (POST):JSON{
  "codigo": "SKY-007",
  "titulo": "Operación Skyfall",
  "descripcion": "Defensa del servidor central en Escocia.",
  "secreto": "Critico",
  "estado": "Pendiente",
  "agenteId": null
}
Gestión de Usuarios (Agentes)MétodoURLDescripciónPermiso RequeridoGET/usersVer lista de agentesAdminGET/aspirantesVer lista de solicitudes pendientesAdminPOST/usersDar de alta un agente (Promocionar aspirante)SOLO ADMINDELETE/aspirantes/:idRechazar/Borrar aspiranteSOLO ADMINEjemplo Body para Crear Usuario/Agente (POST):(Normalmente esto lo hace el Admin cogiendo los datos del aspirante y asignándole contraseña y rol)JSON{
  "email": "jason@unknown.com",
  "password": "123",  
  "nombre": "Jason Bourne",
  "alias": "TREADSTONE",
  "role": "agente"
}
📝 Notas para el Desarrollador (Alumno)JWT: El token expira en 1 hora. Si las peticiones empiezan a dar error 401, haz login de nuevo.Json-Server: Recuerda que al usar POST, PUT o DELETE, los cambios se guardan permanentemente en el archivo db.json. Si quieres "resetear" la base de datos, simplemente copia el contenido original del JSON de nuevo.Filtrado: Json-server permite filtrar por URL. Ejemplo:GET /misiones?estado=Activa (Misiones activas)GET /misiones?agenteId=2 (Misiones de James Bond)
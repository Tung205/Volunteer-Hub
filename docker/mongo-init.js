db = db.getSiblingDB('volunteerhub');
db.createCollection('users');
db.users.insertOne({
  email: 'admin@volunteerhub.com',
  passwordHash: '$2a$10$HASHEDPASSWORD', // thêm bcrypt sau
  name: 'Admin',
  roles: ['ADMIN']
});
print("✅ Mongo initialized with admin user");

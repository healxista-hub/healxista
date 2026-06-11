const fs = require('fs');

let content = fs.readFileSync('e:/Healxista/frontend/src/pages/public/SuperAdminLogin.jsx', 'utf8');

content = content.replace(/const AdminLogin/g, 'const SuperAdminLogin');
content = content.replace(/export default AdminLogin/g, 'export default SuperAdminLogin');
content = content.replace(/const role = 'admin';/g, "const role = 'super_admin';");
content = content.replace(/navigate\('\/admin-dashboard'\);/g, "navigate('/super-admin-dashboard');");
content = content.replace(/Administrative Node/g, 'Super Admin Node');
content = content.replace(/AdminLogin/g, 'SuperAdminLogin'); // Catch any remaining

fs.writeFileSync('e:/Healxista/frontend/src/pages/public/SuperAdminLogin.jsx', content);

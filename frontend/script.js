import fs from 'fs';

const path = 'e:/Healxista/frontend/src/components/Sidebar.jsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure List and Settings are imported
if (!content.includes('List,')) {
    content = content.replace(/LayoutDashboard,/, 'LayoutDashboard, List,');
}

const newSuperAdmin =             case 'super_admin':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin-dashboard' },
                    { name: 'List Directory', icon: List, path: '/super-admin/directory' },
                    { name: 'Activity Log', icon: FileText, path: '/admin/activity' },
                    { name: 'Settings', icon: Settings, path: '/super-admin/settings' }
                ];;

content = content.replace(/            case 'super_admin':[\s\S]*?                \];/, newSuperAdmin);

fs.writeFileSync(path, content);

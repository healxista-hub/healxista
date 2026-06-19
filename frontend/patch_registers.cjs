const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Register.jsx') && f !== 'UserRegister.jsx' && f !== 'DoctorRegister.jsx');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('OtpVerificationModal')) {
        console.log(`Skipping ${file}, already patched.`);
        continue;
    }

    // 1. Add import
    content = content.replace("import { Eye, EyeOff } from 'lucide-react';", "import { Eye, EyeOff } from 'lucide-react';\nimport OtpVerificationModal from '@/components/OtpVerificationModal';");

    // 2. Add state
    content = content.replace("const [error, setError] = useState('');", "const [showOtpModal, setShowOtpModal] = useState(false);\n    const [error, setError] = useState('');");

    // 3. Extract the role and payload from the original fetch
    const fetchMatch = content.match(/const role = '([^']+)';[\s\S]*?const res = await fetch\(`\/api\/auth\/register`, \{\s*method: 'POST',\s*credentials: 'include',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{([^}]+)\}\),/);
    
    if (!fetchMatch) {
        console.log(`Could not find fetch match in ${file}.`);
        continue;
    }

    const role = fetchMatch[1];
    const payloadVars = fetchMatch[2].trim();

    // 4. Create new handleSubmit and handleVerifyOtp
    const originalSubmitRegex = /const handleSubmit = async \(e\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/m;
    
    const newHandlers = `const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(\`/api/auth/send-registration-otp\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                // toast.success('OTP sent to your email!');
                setShowOtpModal(true);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (otp) => {
        setLoading(true);
        try {
            const role = '${role}';
            const res = await fetch(\`/api/auth/register\`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ${payloadVars}, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowOtpModal(false);
                login(data.user, data.token);
                // toast.success('Registration Successful');
                setTimeout(() => {
                    navigate(role === 'admin' ? '/admin-dashboard' : role === 'user' ? '/dashboard' : '/provider-portal');
                }, 100);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };`;

    content = content.replace(originalSubmitRegex, newHandlers);

    // 5. Inject Modal before the login link
    const modalInjection = `
                <OtpVerificationModal 
                    isOpen={showOtpModal} 
                    onClose={() => setShowOtpModal(false)} 
                    email={email} 
                    onVerify={handleVerifyOtp} 
                    isVerifying={loading}
                    onResend={() => handleSubmit()}
                />

                <p className="text-center`;
    
    content = content.replace('<p className="text-center', modalInjection);

    // 6. Update Button text
    content = content.replace(/\{loading \? 'Creating account\.\.\.' : '([^']+)'\}/, "{loading ? 'Sending OTP...' : '$1'}");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
}

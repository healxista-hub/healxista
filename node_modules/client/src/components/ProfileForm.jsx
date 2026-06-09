import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, FileText, Save, Loader2, CheckCircle2 } from 'lucide-react';

const ProfileForm = ({ extraFields = [] }) => {
    const { user, token, login } = useAuth(); // login to re-set context if needed, but not strictly required
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // File states
    const [profilePic, setProfilePic] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [document, setDocument] = useState(null);
    const [previewPic, setPreviewPic] = useState(null);
    const [previewCover, setPreviewCover] = useState(null);

    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const docInputRef = useRef(null);

    const role = user?.role || 'user';
    const id = user?.id;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id || !role) return;
            try {
                const hostname = window.location.hostname;
                const res = await fetch(`/api/profile/${id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);

                    if (data.profile_image_url) {
                        setPreviewPic(`/uploads/${data.profile_image_url}`);
                    }
                    if (data.cover_image_url) {
                        setPreviewCover(`/uploads/${data.cover_image_url}`);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile", err);
                toast.error("Failed to load your profile details");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, role]);

    const handleTextChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handlePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreviewPic(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreviewCover(URL.createObjectURL(file));
        }
    };

    const handleDocChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDocument(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();

            // Append standard fields
            if (profile.name) formData.append('name', profile.name);
            if (profile.mobile) formData.append('mobile', profile.mobile);
            if (profile.bio) formData.append('bio', profile.bio);

            // Append dynamic extra fields mapping camelCase back to DB style or leaving as is for backend mapping
            extraFields.forEach(field => {
                const val = profile[field.name];
                if (val !== undefined && val !== null) {
                    formData.append(field.name, val);
                }
            });

            formData.append('role', role);

            // Append files
            if (profilePic) formData.append('profilePicture', profilePic);
            if (coverImage) formData.append('coverImage', coverImage);
            if (document) formData.append('document', document);

            const hostname = window.location.hostname;
            const res = await fetch(`/api/profile/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Profile updated successfully!');
                const fresh = data.user;
                setProfile(fresh);
                // Update header avatar: sync profile_image_url into auth context
                if (fresh?.profile_image_url) {
                    login({ ...user, profile_image_url: fresh.profile_image_url });
                    setPreviewPic(`/uploads/${fresh.profile_image_url}`);
                }
            } else {
                const errData = await res.json();
                toast.error(errData.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Loading profile...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {profile.is_verified && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2 mb-6 text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <strong>Verified Profile:</strong> Your information and documents have been verified by administrators.
                </div>
            )}

            <div className="flex flex-col gap-8 items-start">
                {/* Cover & Profile Picture Header Section */}
                <div className="w-full relative rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                    {/* Cover Image Area */}
                    <div className="h-48 md:h-64 w-full relative bg-gradient-to-r from-blue-600 to-indigo-700 group cursor-pointer" onClick={() => coverInputRef.current.click()}>
                        {previewCover ? (
                            <img src={previewCover} alt="Cover" className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                        ) : (
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                            <span className="opacity-0 group-hover:opacity-100 text-white font-bold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                                <Camera className="h-4 w-4" /> Change Cover Image
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={coverInputRef}
                            onChange={handleCoverChange}
                        />
                    </div>

                    {/* Avatar Area */}
                    <div className="px-6 pb-6 relative flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 sm:-mt-20">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center relative z-10">
                                {previewPic ? (
                                    <img src={previewPic} alt="Profile" className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                                ) : (
                                    <span className="text-4xl text-slate-400 font-bold uppercase">{profile.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-1 right-1 h-10 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 z-20 border-2 border-white"
                                title="Upload Photo"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handlePicChange}
                            />
                        </div>
                        <div className="flex-1 pb-2">
                            <h2 className="text-2xl font-black text-slate-900">{profile.name || 'Your Profile'}</h2>
                            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                Update your photo and background cover to personalize your presence.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                name="name"
                                value={profile.name || ''}
                                onChange={handleTextChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                value={profile.email || ''}
                                disabled
                                className="bg-slate-50 cursor-not-allowed text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input
                                name="mobile"
                                value={profile.mobile || ''}
                                onChange={handleTextChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Registration No</label>
                            <Input
                                value={profile.custom_id || 'N/A'}
                                disabled
                                className="bg-slate-50 cursor-not-allowed font-mono text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Biography / Description</label>
                        <textarea
                            name="bio"
                            rows="4"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Tell us about yourself or your facility..."
                            value={profile.bio || ''}
                            onChange={handleTextChange}
                        ></textarea>
                    </div>

                    {/* Dynamic Extra Fields (e.g. Specialization, Vehicle No, License) */}
                    {extraFields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                            {extraFields.map((field, idx) => (
                                <div key={idx} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                                    <label className="text-sm font-medium">{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            name={field.name}
                                            value={profile[field.name] || ''}
                                            onChange={handleTextChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="" disabled>Select {field.label}</option>
                                            {field.options?.map((opt, i) => (
                                                <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            value={profile[field.name] || ''}
                                            onChange={handleTextChange}
                                            rows={field.rows || 3}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        ></textarea>
                                    ) : field.type === 'checkbox' ? (
                                        <div className="flex items-center space-x-3 h-10 p-2 border rounded-md bg-slate-50">
                                            <input
                                                type="checkbox"
                                                name={field.name}
                                                checked={!!profile[field.name]}
                                                onChange={handleTextChange}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{field.placeholder}</span>
                                        </div>
                                    ) : (
                                        <Input
                                            type={field.type || 'text'}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            value={profile[field.name] || ''}
                                            onChange={handleTextChange}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Verification Document Upload (Applicable to providers usually, but leaving it generic) */}
                    {role !== 'user' && (
                        <div className="pt-4 border-t space-y-4">
                            <label className="text-sm font-medium block">Identity / License Verification Document</label>
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={() => docInputRef.current.click()}
                                >
                                    <FileText className="h-4 w-4" />
                                    {document ? document.name : (profile.document_url ? 'Upload New Document' : 'Upload Document')}
                                </Button>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    ref={docInputRef}
                                    onChange={handleDocChange}
                                />
                                {profile.document_url && !document && (
                                    <a target="_blank" rel="noreferrer" href={`/uploads/${profile.document_url}`} className="text-sm text-blue-600 hover:underline">
                                        View Current Document
                                    </a>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Upload your medical license, driving license, or registration certificate. PDF or JPEG/PNG allowed.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto flex items-center gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving Profile...' : 'Save Profile Details'}
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;

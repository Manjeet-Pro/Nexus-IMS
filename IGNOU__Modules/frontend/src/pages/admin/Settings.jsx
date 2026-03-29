import React, { useState, useEffect } from 'react';
import { Save, Bell, Lock, User, Globe, Mail, Eye, MapPin } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import getCroppedImg from '../../utils/cropImage';
import { getCurrentUser, updateUser } from '../../utils/auth';
import api from '../../utils/api';

const Toggle = ({ label, description, enabled, onChange }) => (
    <div className="flex items-center justify-between py-4">
        <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

const Settings = () => {
    const user = getCurrentUser();
    const [isSaving, setIsSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
    const [emailNotifs, setEmailNotifs] = useState(user.emailNotifs ?? true);
    const [publicProfile, setPublicProfile] = useState(user.publicProfile ?? true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('System is under maintenance. Please try again later.');

    // Cropper State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState(); // percent crop
    const [completedCrop, setCompletedCrop] = useState(null); // items
    const [zoom, setZoom] = useState(1); // Optional, kept for now
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const imgRef = React.useRef(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/config');
                setMaintenanceMode(data.maintenanceMode);
                setMaintenanceMessage(data.maintenanceMessage);
            } catch (error) {
                console.error("Failed to fetch config:", error);
            }
        };
        fetchConfig();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result);
                setCrop(undefined); // Reset crop
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }

    const handleCropSave = async () => {
        if (!completedCrop || !imgRef.current) {
            // Fallback if they didn't touch anything but image loaded
            // or just show alert
            if (imageSrc && !completedCrop) {
                // Try to force a full center crop or skip
                await handleSkipAndSave();
                return;
            }
            return;
        }

        try {
            // getCroppedImg needs: image (or src), crop pixel data
            // Since we have the imgRef, we can pass the image object directly if we update utils,
            // OR we pass src and the crop object. 
            // Our updated cropImage.js takes (imageSrc, pixelCrop).
            // completedCrop properties are x,y,width,height (pixels) which matches.

            // Note: getCroppedImg creates a new Image() from src. 
            // Ideally we could pass imgRef.current to avoid reloading, but src is cached usually.

            // Note 2: completedCrop might respect the *displayed* size if we are not careful.
            // But ReactCrop returns pixels relative to the image natural dimensions? 
            // NO, ReactCrop returns pixels relative to the *displayed* image if we use those values directly?
            // Wait, ReactCrop `completedCrop` IS in pixels relative to the image element. 
            // If the image is scaled via CSS (max-height), the crop pixels are relative to that scaled size.
            // We need to scale them back to natural size for the canvas. 
            // OR use the percentage crop.

            // Let's refine getCroppedImg to take the image element or handle scale.
            // Actually, usually it's easier to pass scale info or use percent.

            const image = imgRef.current;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            const actualPixelCrop = {
                x: completedCrop.x * scaleX,
                y: completedCrop.y * scaleY,
                width: completedCrop.width * scaleX,
                height: completedCrop.height * scaleY,
            };

            const croppedImage = await getCroppedImg(imageSrc, actualPixelCrop);

            if (!croppedImage) throw new Error("Failed to generate image");

            setAvatarPreview(croppedImage);
            setIsCropModalOpen(false);
            setImageSrc(null);
        } catch (e) {
            console.error(e);
            alert("Failed to process image: " + (e.response?.data?.message || e.message));
        }
    };

    const handleSave = async (arg = null) => {
        setIsSaving(true);
        try {
            // Update User Profile
            const profileData = {
                publicProfile,
                emailNotifs,
                name: user.name, // Assuming user.name is available and should be sent
                avatar: avatarPreview
            };
            const result = await updateUser(profileData);

            // Update System Config if Admin
            if (user.role === 'admin') {
                await api.put('/config', {
                    maintenanceMode,
                    maintenanceMessage
                });
            }

            if (result.success) {
                alert('Settings updated successfully!');
                // Optionally reload or update local user state
                // window.location.reload(); // If a full refresh is desired
            } else {
                alert(result.message || 'Failed to update settings.');
            }
        } catch (error) {
            console.error("Save failed:", error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkipAndSave = async () => {
        try {
            // Force compress/process original image without crop
            // Pass null for pixelCrop to use full image
            const processedImage = await getCroppedImg(imageSrc, null);

            if (!processedImage) {
                throw new Error("Failed to process image");
            }

            // Save immediately
            await handleSave({
                ...settings,
                avatar: processedImage
            });

            setIsCropModalOpen(false);

        } catch (e) {
            console.error(e);
            alert("Failed to save image: " + e.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
                {/* Profile Picture Section */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6 text-gray-900 dark:text-white">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-lg font-medium">Profile Picture</h2>
                    </div>
                    <div className="pl-8 flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <img
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.name}`}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-sm"
                            />
                            <div className="mt-3 text-center">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <Mail className="w-3 h-3" />
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer text-sm font-medium shadow-sm">
                                Change Photo
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2 text-gray-900 dark:text-white">
                        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-lg font-medium">Preferences</h2>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</div>
                                <div className="text-xs text-gray-500">Receive weekly summaries and alerts</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setEmailNotifs(!emailNotifs)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailNotifs ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Maintenance Mode (Admin Only) */}
                    {user.role === 'admin' && (
                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</div>
                                        <div className="text-xs text-gray-500">Block all non-admin access</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {maintenanceMode && (
                                <div className="animate-in slide-in-from-top duration-300">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Maintenance Message</label>
                                    <textarea
                                        value={maintenanceMessage}
                                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="Custom message for users..."
                                        rows="2"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">Public Profile</div>
                                <div className="text-xs text-gray-500">Allow others to see your profile details</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setPublicProfile(!publicProfile)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${publicProfile ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publicProfile ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>
            {/* Crop Modal */}
            {isCropModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 shrink-0">
                            <h3 className="font-bold text-gray-900 dark:text-white">Crop Profile Picture</h3>
                            <button onClick={() => setIsCropModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 bg-gray-900 flex items-center justify-center min-h-[300px]">
                            {imageSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop={false}
                                    keepSelection
                                    className="max-h-[60vh]"
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imageSrc}
                                        style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }}
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            )}
                        </div>

                        <div className="p-6 space-y-6 shrink-0 bg-white dark:bg-gray-800">
                            {/* Zoom is less critical with this lib as you crop the full image, but keeping it as a "Scale" feature if desirable, 
                                 though standard ReactCrop usage usually doesn't need zoom on the img itself unless it's huge. 
                                 Let's keep it simple first matching the user screenshot which usually doesn't show a zoom slider for the base image 
                                 but let's keep it effectively as a 'preview' scale if needed, or just remove if redundant. 
                                 Actually, for this library, zooming the *image* inside the cropper can be tricky. 
                                 Let's comment out zoom for now to strictly follow the "selection box" model initially. */}

                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                Drag to position and resize the square selection box.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsCropModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-md transition-all hover:shadow-lg active:scale-95"
                                >
                                    Save Photo
                                </button>
                            </div>
                            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleSkipAndSave}
                                    className="text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 underline transition-colors"
                                >
                                    Skip Cropping (Use Full Image)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { CLUSTERS } from '@/lib/types';

export default function ProfileManager() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [cluster, setCluster] = useState('MotoGP');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [savingStep, setSavingStep] = useState<'uploading' | 'saving' | null>(null);
    const [message, setMessage] = useState('');
    const [bucketChecked, setBucketChecked] = useState(false);
    const supabase = createClient();

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name');
        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const ensureBucket = async () => {
        if (bucketChecked) return;

        // Check if bucket exists, create if not
        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = buckets?.some((b) => b.name === 'photos');
        if (!exists) {
            await supabase.storage.createBucket('photos', {
                public: true,
                fileSizeLimit: 25 * 1024 * 1024, // Increased to 25MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            });
        }
        setBucketChecked(true);
    };

    const uploadPhoto = async (file: File, profileName: string): Promise<string | null> => {
        setSavingStep('uploading');
        await ensureBucket();

        const fileExt = file.name.split('.').pop();
        const fileName = `${profileName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('photos')
            .upload(fileName, file, {
                upsert: true,
                cacheControl: '3600'
            });

        if (error) {
            console.error('Upload error:', error);
            setMessage(`Photo upload error: ${error.message}`);
            return null;
        }

        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        return urlData.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final size check before submit
        if (photoFile && photoFile.size > 25 * 1024 * 1024) {
            setMessage('Error: Photo must be less than 25MB');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            let photoUrl: string | null = null;

            if (photoFile) {
                photoUrl = await uploadPhoto(photoFile, name);
                if (!photoUrl) {
                    setSaving(false);
                    setSavingStep(null);
                    return;
                }
            }

            setSavingStep('saving');
            if (editingId) {
                // Update existing profile
                const updateData: Record<string, string> = { name, cluster };
                if (photoUrl) updateData.photo_url = photoUrl;

                const { error } = await supabase
                    .from('profiles')
                    .update(updateData)
                    .eq('id', editingId);

                if (error) throw error;
                setMessage('✅ Profile updated!');
            } else {
                // Insert new profile
                const { error } = await supabase.from('profiles').insert({
                    name,
                    cluster,
                    photo_url: photoUrl,
                });

                if (error) throw error;
                setMessage('✅ Profile created!');
            }

            resetForm();
            fetchProfiles();
        } catch (err) {
            setMessage(err instanceof Error ? `Error: ${err.message}` : 'Failed to save');
        } finally {
            setSaving(false);
            setSavingStep(null);
        }
    };

    const handleEdit = (profile: Profile) => {
        setEditingId(profile.id);
        setName(profile.name);
        setCluster(profile.cluster || 'MotoGP');
        setPhotoPreview(profile.photo_url);
        setPhotoFile(null);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this profile?')) return;
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('🗑️ Profile deleted');
            fetchProfiles();
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setName('');
        setCluster('MotoGP');
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <span className="text-lg">👤</span>
                    </div>
                    <div>
                        <h2
                            className="text-lg font-bold text-white"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                            PROFILES
                        </h2>
                        <p className="text-xs text-gray-600">
                            Manage employee profiles and photos
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="px-4 py-2 text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#ED1C24] to-[#b91520] rounded-lg hover:from-[#ff2d35] hover:to-[#ED1C24] transition-all shadow-lg shadow-[#ED1C24]/20 cursor-pointer"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                    {showForm ? 'Cancel' : '+ Add Profile'}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`px-4 py-3 rounded-xl text-sm ${message.startsWith('Error') || message.startsWith('Photo upload')
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-green-500/10 border border-green-500/30 text-green-400'
                        }`}
                >
                    {message}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 space-y-4"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#0D0D0D] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ED1C24] transition-all"
                                placeholder="Employee name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                Cluster
                            </label>
                            <select
                                value={cluster}
                                onChange={(e) => setCluster(e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#0D0D0D] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#ED1C24] transition-all"
                            >
                                {CLUSTERS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                            Photo
                        </label>
                        <div className="flex items-center gap-4">
                            {/* Preview */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0D0D0D] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-600 text-2xl">👤</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#1a1a1a] file:text-gray-300 file:cursor-pointer hover:file:bg-[#2a2a2a] file:transition-all cursor-pointer"
                                />
                                <p className="text-[10px] text-gray-600 mt-1">
                                    JPG, PNG or WebP. Max 25MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#ED1C24] to-[#b91520] rounded-lg hover:from-[#ff2d35] hover:to-[#ED1C24] transition-all disabled:opacity-50 cursor-pointer min-w-[100px]"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    {savingStep === 'uploading' ? 'Uploading...' : 'Saving...'}
                                </span>
                            ) : editingId ? 'Update' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-2.5 text-xs text-gray-400 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Profile List */}
            {loading ? (
                <div className="text-center py-8 text-gray-600 animate-pulse">
                    Loading profiles...
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-8 text-gray-600 border border-dashed border-[#2a2a2a] rounded-xl">
                    <p className="text-sm">No profiles yet. Add your first employee above.</p>
                </div>
            ) : (
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#2a2a2a]">
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Photo</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Name</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Cluster</th>
                                    <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map((profile) => (
                                    <tr
                                        key={profile.id}
                                        className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50 transition-colors"
                                    >
                                        <td className="px-4 py-2">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0D0D0D] border border-[#2a2a2a]">
                                                {profile.photo_url ? (
                                                    <img
                                                        src={profile.photo_url}
                                                        alt={profile.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">
                                                        {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-white font-medium">{profile.name}</td>
                                        <td className="px-4 py-2 text-gray-400">{profile.cluster || '—'}</td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(profile)}
                                                    className="px-3 py-1 text-xs text-blue-400 border border-blue-500/30 rounded-md hover:bg-blue-500/10 transition-all cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(profile.id)}
                                                    className="px-3 py-1 text-xs text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/10 transition-all cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

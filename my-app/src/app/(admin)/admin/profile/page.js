"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { User, Save, Lock, Loader2, Camera } from "lucide-react";
import profileApi from "@/lib/profileApi";
import { uploadImage } from "@/lib/uploadApi";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [image, setImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await profileApi.get();
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setDesignation(data.designation || "");
        setImage(data.image || "");
      } catch (e) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, "profile");
      setImage(url);
    } catch (err) {
      toast.error(err.message || "Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New password and confirmation don't match");
      return;
    }
    if (newPassword && !currentPassword) {
      toast.error("Enter your current password to set a new one");
      return;
    }
    setSaving(true);
    try {
      const payload = { name, email, designation, image };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const updated = await profileApi.update(payload);
      setProfile(updated);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-2">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <User size={20} className="text-blue-600" /> My Profile
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Update your personal details and login credentials.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full bg-slate-100 overflow-hidden shrink-0">
              {image ? <img src={image} alt="Profile" className="h-full w-full object-cover" /> : (
                <div className="h-full w-full flex items-center justify-center text-slate-400"><User size={28} /></div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
              </label>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{name || "Admin"}</p>
              <p className="text-xs text-slate-400">{uploadingPhoto ? "Uploading photo…" : "Click photo to change"}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Designation</label>
              <input value={designation} onChange={(e) => setDesignation(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Lock size={13} /> Change Password
          </h2>
          <p className="text-[11px] text-slate-400">Leave blank to keep your current password.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Globe, Shield, Bell, Database } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('bt_global_settings');
        return saved ? JSON.parse(saved) : {
            collegeName: 'Beautex Technical College',
            collegeAbbr: 'BTC',
            academicYear: '2025/2026',
            semester: 'Semester 1',
            notificationEnabled: true,
            maintenanceMode: false
        };
    });

    const handleSave = () => {
        localStorage.setItem('bt_global_settings', JSON.stringify(settings));
        alert('Global Directives synchronized successfully across campus network.');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-primary tracking-tight uppercase">Global Directives</h1>
                <p className="text-xs text-primary/40 font-bold tracking-widest mt-1">System-wide Configuration & Settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div className="card-light p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Globe className="w-5 h-5 text-accent" />
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest">Institution Profile</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">College Name</label>
                                <input
                                    type="text"
                                    value={settings.collegeName}
                                    onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                                    className="w-full px-5 py-4 bg-parchment border-none rounded-2xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Abbreviation</label>
                                <input
                                    type="text"
                                    value={settings.collegeAbbr}
                                    onChange={(e) => setSettings({ ...settings, collegeAbbr: e.target.value })}
                                    className="w-full px-5 py-4 bg-parchment border-none rounded-2xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Settings */}
                    <div className="card-light p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Database className="w-5 h-5 text-accent" />
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest">Academic Framework</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Active Year</label>
                                <input
                                    type="text"
                                    value={settings.academicYear}
                                    onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                                    className="w-full px-5 py-4 bg-parchment border-none rounded-2xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Current Semester</label>
                                <select
                                    value={settings.semester}
                                    onChange={(e) => setSettings({ ...settings, semester: e.target.value })}
                                    className="w-full px-5 py-4 bg-parchment border-none rounded-2xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                >
                                    <option>Semester 1</option>
                                    <option>Semester 2</option>
                                    <option>Summer Session</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Toggles */}
                <div className="space-y-6">
                    <div className="card-light p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="w-5 h-5 text-accent" />
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest">Controls</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-parchment rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Directives</p>
                                    <p className="text-[9px] text-primary/40 font-bold uppercase mt-0.5">Push Notifications</p>
                                </div>
                                <input type="checkbox" checked={settings.notificationEnabled} onChange={() => setSettings({ ...settings, notificationEnabled: !settings.notificationEnabled })} className="w-10 h-5 bg-primary/10 rounded-full appearance-none checked:bg-accent transition-all cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-all checked:after:left-6" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-parchment rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Maintenance</p>
                                    <p className="text-[9px] text-red-500 font-bold uppercase mt-0.5">System Lock</p>
                                </div>
                                <input type="checkbox" checked={settings.maintenanceMode} onChange={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })} className="w-10 h-5 bg-primary/10 rounded-full appearance-none checked:bg-red-500 transition-all cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-all checked:after:left-6" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-accent py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-dark shadow-xl transition-all border border-accent/20 flex items-center justify-center gap-3"
                    >
                        <Save className="w-4 h-4" /> Save Directives
                    </button>
                </div>
            </div>
        </div>
    );
}

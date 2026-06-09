import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AvailabilityToggle = ({ accountId }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/profile/${accountId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.is_online !== undefined) {
                        setIsOnline(data.is_online);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch initial status", err);
            } finally {
                setLoading(false);
            }
        };
        if (accountId) fetchStatus();
    }, [accountId]);

    const handleToggle = async (checked) => {
        setIsOnline(checked);
        setLoading(true);
        try {
            const res = await fetch(`/api/profile/${accountId}/availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_online: checked })
            });

            if (!res.ok) throw new Error('Failed to update status');
            
            toast.success(`You are now ${checked ? 'Online' : 'Offline'}`);
        } catch (error) {
            console.error(error);
            toast.error('Could not update status');
            setIsOnline(!checked); // Revert
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <Switch 
                id="availability-mode" 
                checked={isOnline} 
                onCheckedChange={handleToggle}
                disabled={loading}
                className={isOnline ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-slate-300"}
            />
            <Label htmlFor="availability-mode" className="font-semibold select-none cursor-pointer">
                {isOnline ? (
                    <span className="text-green-600 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Online</span>
                ) : (
                    <span className="text-slate-500 text-sm">Offline</span>
                )}
            </Label>
        </div>
    );
};

export default AvailabilityToggle;

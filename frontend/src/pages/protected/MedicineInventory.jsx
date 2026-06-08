import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Package, AlertTriangle } from 'lucide-react';

const MedicineInventory = () => {
    const { user, token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        name: '',
        description: '',
        manufacturer: '',
        price: '',
        stock: '',
        isPrescriptionRequired: false
    });

    const fetchInventory = async () => {
        if (!user?.id) return;
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/inventory/store/${user.id}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setInventory(data);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [user, token]);

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/inventory/add`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    accountId: user.id,
                    ...newMedicine,
                    price: parseFloat(newMedicine.price),
                    stock: parseInt(newMedicine.stock)
                })
            });

            if (res.ok) {
                setIsAddModalOpen(false);
                setNewMedicine({ name: '', description: '', manufacturer: '', price: '', stock: '', isPrescriptionRequired: false });
                fetchInventory();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to add medicine');
            }
        } catch (error) {
            console.error('Add medicine error:', error);
            alert('Error adding medicine');
        }
    };

    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Stock <span className="text-red-600">Commander</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Medicine Inventory & Logistics</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[11px] h-14 px-8 rounded-[1.25rem] shadow-xl transition-all">
                    <Plus className="mr-2 h-5 w-5" />
                    New Medicine Entry
                </Button>
            </motion.div>

            {/* Add Medicine Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader className="bg-green-600 text-white rounded-t-xl">
                            <CardTitle className="text-xl">Add New Medicine</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleAddMedicine} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Medicine Name</label>
                                    <Input
                                        required
                                        placeholder="e.g., Paracetamol"
                                        value={newMedicine.name}
                                        onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Manufacturer</label>
                                    <Input
                                        placeholder="e.g., GSK"
                                        value={newMedicine.manufacturer}
                                        onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Price (₹)</label>
                                        <Input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={newMedicine.price}
                                            onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Stock Qty</label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder="100"
                                            value={newMedicine.stock}
                                            onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        id="rx"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                                        checked={newMedicine.isPrescriptionRequired}
                                        onChange={(e) => setNewMedicine({...newMedicine, isPrescriptionRequired: e.target.checked})}
                                    />
                                    <label htmlFor="rx" className="text-sm font-medium text-gray-700">Prescription Required</label>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Save Medicine</Button>
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search inventory..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile Card View */}
                    <div className="grid gap-4 md:hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Scanning Warehouse...</div>
                        ) : filteredInventory.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No entries detected</div>
                        ) : (
                            filteredInventory.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.manufacturer || 'GENERIC'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</p>
                                            <p className="font-black text-slate-900">{item.stock} {item.unit || 'UNITS'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiration</p>
                                            <p className="font-black text-slate-700 text-xs">{item.expiry || '--/--'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                            'bg-rose-50 text-rose-700 border border-rose-100'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                                            Update
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left border-separate border-spacing-y-3">
                            <thead className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                <tr>
                                    <th className="px-8 py-4">Medicine & Grade</th>
                                    <th className="px-8 py-4">Category</th>
                                    <th className="px-8 py-4">Available Stock</th>
                                    <th className="px-8 py-4">Expiration</th>
                                    <th className="px-8 py-4">Inventory Status</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-bold animate-pulse">Scanning Warehouse...</td></tr>
                                ) : filteredInventory.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">No entries detected</td></tr>
                                ) : (
                                    filteredInventory.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50 transition-all shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                                            <td className="px-8 py-5 rounded-l-2xl border-l-4 border-l-transparent group-hover:border-l-red-500">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.manufacturer || 'GENERIC'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                                                    {item.category || 'PHARMA'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-black text-slate-900 text-lg">{item.stock}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.unit || 'UNITS'}</p>
                                            </td>
                                            <td className="px-8 py-5 font-black text-slate-700 text-xs uppercase">{item.expiry || '--/--'}</td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                        item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                        item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                        'bg-rose-50 text-rose-700 border border-rose-100'
                                                    }`}>
                                                    {item.status === 'Low Stock' && <AlertTriangle className="mr-1.5 h-3 w-3" />}
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right rounded-r-2xl">
                                                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                                                    Update
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MedicineInventory;




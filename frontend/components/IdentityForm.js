"use client";

import { useEffect, useState } from 'react';
import { useMetaMask } from '@/context/MetaMaskContext';

const IdentityForm = () => {
    const { identity, createIdentity, updateIdentity, deleteIdentity } = useMetaMask();
    const [formData, setFormData] = useState({
        name: identity?.name || '',
        email: identity?.email || '',
        age: identity?.age || '',
        country: identity?.country || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    useEffect(()=>{
            console.log('identity ',identity);
            if(identity){

                    setFormData(prev => ({ ...prev, ...identity }));
            }
            
            
    },[identity||[]]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name,value)
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        console.log('Form Data : ',formData);
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            let success;
            if (identity) {
                console.log('identity ',identity);

                success = await updateIdentity(
                    formData.name,
                    formData.email,
                    parseInt(formData.age||20),
                    formData.country
                );
                console.log('update identity ', success);
                setMessage({ text: 'Identity updated successfully!', type: 'success' });
            } else {
                success = await createIdentity(
                    formData.name,
                    formData.email,
                    parseInt(formData.age),
                    formData.country
                );
                setMessage({ text: 'Identity created successfully!', type: 'success' });
            }

            if (!success) {
                setMessage({ text: 'Operation failed. Please try again.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your identity?')) {
            setIsLoading(true);
            setMessage({ text: '', type: '' });

            try {
                const success = await deleteIdentity();
                if (success) {
                    setFormData({ name: '', email: '', age: '', country: '' });
                    setMessage({ text: 'Identity deleted successfully!', type: 'success' });
                } else {
                    setMessage({ text: 'Failed to delete identity.', type: 'error' });
                }
            } catch (error) {
                setMessage({ text: 'An error occurred while deleting.', type: 'error' });
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        
        <div className="bg-white p-6 top-10 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
                {identity ? 'Update Your Identity' : 'Create Your Identity'}
            </h2>

            {message.text && (
                <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input  type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age }
                        onChange={handleChange}
                        min="1"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                 
                <div className="flex space-x-3">
                   <button
                        type="submit"
                        disabled={isLoading}
                        onSubmit={handleSubmit}
                        className={`px-4 py-2 bg-blue-600 text-white cursor-pointer
                             rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 
                             focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 
                                'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Processing...' : identity ? 'Update Identity' : 
                        'Create Identity'}
                    </button>

                    {identity && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className={`px-4 py-2 bg-red-600 cursor-pointer  text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Delete Identity
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default IdentityForm;
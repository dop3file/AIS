import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Zones = () => {
    const [zones, setZones] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', location: '' });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const response = await api.get('/zones/');
            setZones(response.data);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingZone) {
                await api.put(`/zones/${editingZone.id}`, formData);
            } else {
                await api.post('/zones/', formData);
            }
            fetchZones();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving zone:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту зону?')) {
            try {
                await api.delete(`/zones/${id}`);
                fetchZones();
            } catch (error) {
                console.error('Error deleting zone:', error);
            }
        }
    };

    const handleOpenModal = (zone = null) => {
        if (zone) {
            setEditingZone(zone);
            setFormData({ name: zone.name, description: zone.description, location: zone.location });
        } else {
            setEditingZone(null);
            setFormData({ name: '', description: '', location: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingZone(null);
        setFormData({ name: '', description: '', location: '' });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Зоны вещания</h1>
                <Button onClick={() => handleOpenModal()}><FaPlus /> Добавить зону</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {zones.map((zone) => (
                    <Card key={zone.id}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{zone.name}</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{zone.description}</p>
                        {zone.location && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                                <strong>Местоположение:</strong> {zone.location}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={() => handleOpenModal(zone)}><FaEdit /></Button>
                            <Button variant="ghost" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(zone.id)}><FaTrash /></Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingZone ? 'Редактировать зону' : 'Создать зону'}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Название</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Описание</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', minHeight: '100px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Местоположение</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>Отмена</Button>
                        <Button type="submit">{editingZone ? 'Обновить' : 'Создать'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Zones;

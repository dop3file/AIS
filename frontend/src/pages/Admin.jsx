import React, { useState, useEffect } from 'react';
import { FaUserShield, FaUserEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import './Admin.css';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleEditRole = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsEditModalOpen(true);
    };

    const handleUpdateRole = async () => {
        try {
            await api.put(`/admin/users/${selectedUser.id}`, { role: newRole });
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.detail || 'Ошибка удаления пользователя');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1><FaUserShield /> Панель администратора</h1>
                <p>Управление пользователями системы</p>
            </div>

            <Card>
                <div className="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                <th>Дата создания</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Активен' : 'Неактивен'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleEditRole(user)}
                                                title="Изменить роль"
                                            >
                                                <FaUserEdit />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDeleteUser(user.id)}
                                                title="Удалить"
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Изменить роль пользователя"
            >
                {selectedUser && (
                    <div className="edit-user-modal">
                        <p><strong>Пользователь:</strong> {selectedUser.username} ({selectedUser.email})</p>

                        <div className="form-group">
                            <label>Роль</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                <option value="user">Пользователь</option>
                                <option value="admin">Администратор</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <Button onClick={handleUpdateRole} variant="primary">
                                Сохранить
                            </Button>
                            <Button onClick={() => setIsEditModalOpen(false)} variant="secondary">
                                Отмена
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Admin;

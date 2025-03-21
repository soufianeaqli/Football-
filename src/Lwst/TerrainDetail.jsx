import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoginPrompt from './LoginPrompt';

function TerrainDetail({ terrains, addReservation, reservations, user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const terrain = terrains.find(t => t.id === parseInt(id));
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        timeSlot: ''
    });
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [savedReservations, setSavedReservations] = useState(() => {
        const saved = localStorage.getItem('terrainDetailReservations');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('terrainDetailReservations', JSON.stringify(savedReservations));
    }, [savedReservations]);

    if (!terrain) {
        return <div>Terrain non trouvé</div>;
    }

    const handleReserveClick = () => {
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
        setIsReservationModalOpen(true);
    };

    const handleCloseReservationModal = () => {
        setIsReservationModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const conflict = reservations.some(reservation =>
            reservation.terrainId === terrain.id &&
            reservation.date === formData.date &&
            reservation.timeSlot === formData.timeSlot
        );

        if (conflict) {
            setConfirmationMessage('Une réservation existe déjà pour cette date et heure.');
            setTimeout(() => {
                setConfirmationMessage('');
            }, 5000);
            return;
        }

        const newReservation = {
            id: Date.now(),
            terrainId: terrain.id,
            ...formData
        };
        addReservation(newReservation);
        
        // Mettre à jour localStorage
        const updatedReservations = [...savedReservations, newReservation];
        setSavedReservations(updatedReservations);
        localStorage.setItem('terrainDetailReservations', JSON.stringify(updatedReservations));
        
        setIsReservationModalOpen(false);
        setFormData({ name: '', date: '', timeSlot: '' });
        setConfirmationMessage('Votre réservation a été enregistrée. Veuillez attendre la réponse de l\'administrateur.');
        
        setTimeout(() => {
            setConfirmationMessage('');
        }, 5000);
    };

    const today = new Date().toISOString().split('T')[0];

    const timeSlots = [
        "09:00-10:00", "10:00-11:00", "11:00-12:00",
        "15:00-16:00", "16:00-17:00", "17:00-18:00",
        "18:00-19:00", "19:00-20:00", "20:00-21:00",
        "21:00-22:00"
    ];

    const reservedSlots = reservations
        .filter(reservation => reservation.terrainId === terrain.id && reservation.date === formData.date)
        .map(reservation => reservation.timeSlot);

    return (
        <div className="terrain-detail">
            {showLoginPrompt && <LoginPrompt />}
            <h1>{terrain.Title}</h1>
            <img src={`/${terrain.photo}`} alt={terrain.Title} className="terrain-image" />
            <p>{terrain.description}</p>
            <p>Ce terrain est équipé de vestiaires modernes, d'un éclairage LED pour les matchs nocturnes, et d'un système de drainage avancé pour garantir des conditions de jeu optimales même après la pluie. Idéal pour les tournois et les événements sportifs.</p>
            <p className="terrain-price">Prix: {terrain.price} DH</p>
            <button className="btn-reserve" onClick={handleReserveClick}>
                <i className="fas fa-calendar-plus"></i> Réserver ce terrain
            </button>
            <button className="btn-back" onClick={() => navigate('/terrain')}>
                <i className="fas fa-arrow-left"></i> Retour
            </button>

            {isReservationModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Réserver {terrain.Title}</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Nom:</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Date de Réservation:</label>
                                <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Plage Horaire:</label>
                                <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} required>
                                    <option value="" disabled>Choisir une heure</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot} disabled={reservedSlots.includes(slot)}>
                                            {reservedSlots.includes(slot) ? `${slot} (Réservé)` : slot}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-ajt">
                                    <i className="fas fa-check"></i> Réserver
                                </button>
                                <button type="button" className="btn-annuler" onClick={handleCloseReservationModal}>
                                    <i className="fas fa-times"></i> Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmationMessage && (
                <div className="confirmation-message">
                    {confirmationMessage}
                </div>
            )}
        </div>
    );
}

export default TerrainDetail;

import React, { useState } from 'react';
import type { Student } from '../types';
import { StudentRegistrationForm } from './StudentRegistrationForm';

export const StudentRegistration: React.FC = () => {
    const [showForm, setShowForm] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [successStudent, setSuccessStudent] = useState<Student | null>(null);

    const handleRegistrationSuccess = (newStudent: Student) => {
        setSuccessStudent(newStudent);
        setSuccessMessage(`✅ Élève inscrit avec succès ! ID: ${newStudent.id}`);
        setShowForm(false);
        setTimeout(() => {
            setShowForm(true);
            setSuccessMessage(null);
            setSuccessStudent(null);
        }, 3000);
    };

    const handleCancel = () => {
        setShowForm(false);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800">Inscription Nouvel Élève 🎓</h1>
                <p className="text-lg text-gray-500">Formulaire d'inscription digital - École KSP</p>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center font-medium">
                    {successMessage}
                    {successStudent && (
                        <p className="text-sm mt-2">
                            Élève: {successStudent.firstName} {successStudent.lastName} | ID: {successStudent.id}
                        </p>
                    )}
                </div>
            )}

            {showForm ? (
                <StudentRegistrationForm 
                    onSuccess={handleRegistrationSuccess}
                    onCancel={handleCancel}
                />
            ) : (
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <p className="text-gray-600">Fermeture du formulaire...</p>
                </div>
            )}
        </div>
    );
};

export default StudentRegistration;
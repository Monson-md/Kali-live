import React, { useState, useEffect } from "react";

// Définition de l'URL de base de l'API (à adapter si votre backend n'est pas sur le port 8000)
// Nous utilisons le préfixe /ctf que vous avez défini dans main.py
const API_BASE_URL = "http://localhost:8000/ctf"; 

export default function CTFManager() {
    // State pour la création de défi
    const [list, setList] = useState([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("web");
    const [description, setDescription] = useState("");
    const [flag, setFlag] = useState("");
    const [points, setPoints] = useState(100);
    const [creationMsg, setCreationMsg] = useState("");

    // State pour la soumission de flag (Modale)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentChallengeId, setCurrentChallengeId] = useState(null);
    const [submissionFlag, setSubmissionFlag] = useState("");
    const [submissionResult, setSubmissionResult] = useState(null); // { result: 'correct'|'incorrect', points: 100|0 }

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/list`);
            if (!res.ok) throw new Error("Erreur lors de la récupération de la liste");
            const data = await res.json();
            setList(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            setCreationMsg("Erreur de connexion à l'API.");
        }
    };

    const createChallenge = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, description, flag, points: parseInt(points, 10) })
            });
            if (!res.ok) throw new Error("Erreur de création du défi.");
            const j = await res.json();
            setCreationMsg(`Défi créé: ${j.title} (ID: ${j.id})`);
            // Réinitialiser les champs
            setTitle('');
            setDescription('');
            setFlag('');
            setPoints(100);
            fetchList();
        } catch (error) {
            console.error("Create Error:", error);
            setCreationMsg("Erreur lors de la création du défi.");
        }
    };

    const openSubmissionModal = (id) => {
        setCurrentChallengeId(id);
        setSubmissionFlag("");
        setSubmissionResult(null);
        setIsModalOpen(true);
    };

    const checkFlag = async () => {
        if (!currentChallengeId || !submissionFlag) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/check-flag`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Note: J'ai corrigé l'importation de 'cat' à 'category'
                body: JSON.stringify({ id: currentChallengeId, flag: submissionFlag, user: "local-user" })
            });

            if (res.status === 404) {
                setSubmissionResult({ result: "error", message: "Défi non trouvé." });
                return;
            }

            const j = await res.json();
            setSubmissionResult(j);

        } catch (error) {
            console.error("Check Flag Error:", error);
            setSubmissionResult({ result: "error", message: "Erreur de communication API." });
        }
    };

    const SubmissionModal = () => {
        if (!isModalOpen) return null;

        const currentCh = list.find(ch => ch.id === currentChallengeId) || { title: 'Défis inconnu' };

        let resultMessage = null;
        if (submissionResult) {
            if (submissionResult.result === 'correct') {
                resultMessage = (
                    <div className="text-green-600 font-semibold mt-2">
                        Correct ! Vous gagnez {submissionResult.points} points.
                    </div>
                );
            } else if (submissionResult.result === 'incorrect') {
                resultMessage = (
                    <div className="text-red-600 font-semibold mt-2">
                        Drapeau incorrect. Réessayez.
                    </div>
                );
            } else if (submissionResult.result === 'error') {
                 resultMessage = (
                    <div className="text-yellow-600 font-semibold mt-2">
                        Erreur: {submissionResult.message}
                    </div>
                );
            }
        }

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <h4 className="text-xl font-bold mb-4 text-gray-800">Soumettre le drapeau pour : {currentCh.title}</h4>
                    
                    <input
                        type="text"
                        placeholder="Entrez le drapeau (flag)"
                        value={submissionFlag}
                        onChange={(e) => setSubmissionFlag(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submissionResult && submissionResult.result !== 'incorrect' && submissionResult.result !== 'error'}
                    />
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                        >
                            Fermer
                        </button>
                        <button
                            onClick={checkFlag}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                            disabled={!submissionFlag || (submissionResult && submissionResult.result !== 'incorrect' && submissionResult.result !== 'error')}
                        >
                            Vérifier
                        </button>
                    </div>
                    {resultMessage}
                </div>
            </div>
        );
    };


    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-2">CTF Lab Manager</h1>

            {/* Section Création de Défi */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Créer un nouveau défi</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <input 
                        placeholder="Titre du défi" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        className="col-span-1 md:col-span-2 p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                     <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                    >
                        <option value="web">web</option>
                        <option value="crypto">crypto</option>
                        <option value="forensics">forensics</option>
                        <option value="pwn">pwn</option>
                    </select>
                    <input 
                        placeholder="Flag (solution)" 
                        value={flag} 
                        onChange={e => setFlag(e.target.value)} 
                        className="p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input 
                        type="number"
                        placeholder="Points" 
                        value={points} 
                        onChange={e => setPoints(e.target.value)} 
                        className="p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <textarea 
                        placeholder="Description détaillée du défi" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        className="col-span-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                    />
                </div>
                <div className="flex justify-between items-center mt-4">
                    <button 
                        onClick={createChallenge}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                        disabled={!title || !flag || !description}
                    >
                        Créer le Défi
                    </button>
                    <div className={`text-sm ${creationMsg.startsWith('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                        {creationMsg}
                    </div>
                </div>
            </div>

            {/* Section Liste des Défis */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Défis Existants ({list.length})</h3>
                {list.length === 0 ? (
                    <p className="text-gray-500 italic">Aucun défi créé pour le moment.</p>
                ) : (
                    <ul className="space-y-3">
                        {list.map(ch => (
                            <li key={ch.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                <div>
                                    <strong className="text-gray-800">{ch.title}</strong> 
                                    <span className="ml-2 text-sm text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{ch.category}</span>
                                    <span className="ml-4 text-sm text-gray-600">{ch.points} pts</span>
                                    <p className="text-xs text-gray-500 mt-1">{ch.description.substring(0, 100)}...</p>
                                </div>
                                <button 
                                    onClick={() => openSubmissionModal(ch.id)}
                                    className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-sm hover:bg-teal-600 transition duration-150 text-sm"
                                >
                                    Soumettre Flag
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modale de Soumission */}
            <SubmissionModal />
        </div>
    );
}